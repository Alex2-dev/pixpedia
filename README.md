# Pixpedia

Jeu web de cartes à collectionner où **chaque carte est un vrai jeu vidéo** (données IGDB).
Studio Alex². Spécification complète : [docs/spec.md](docs/spec.md), décisions prises : [docs/decisions.md](docs/decisions.md).

État actuel : phases 0 à 5 de la roadmap (socle, catalogue IGDB, calibrage et tirage, comptes et packs, front de jeu, sets, packs thématiques et recyclage), plus les animations d'ouverture et de drop. En ligne sur https://alex2-server.fr/pixpedia/.

## Structure

```
apps/web         React + TypeScript + Vite (PWA) — le jeu (packs, codex, sets, détail, animations)
apps/api         Fastify — comptes, packs, collection, recherche
apps/worker      CLI d'import / sync IGDB (+ planificateur quotidien)
packages/shared  Règles du jeu : raretés, prestige, stats, familles, filtres, schémas zod
packages/db      Schéma Drizzle, migrations, client PostgreSQL
docs/            spec.md, decisions.md
```

## En ligne

**https://alex2-server.fr/pixpedia/** — pile de production séparée du dev (`docker-compose.prod.yml`) :

| Service   | Rôle                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------- |
| `db`      | PostgreSQL 16 de production (volume `pixpedia-prod_pgdata`, non exposé)                                  |
| `migrate` | Applique les migrations au démarrage                                                                     |
| `api`     | API Fastify (sans rechargement à chaud)                                                                  |
| `worker`  | Sync IGDB chaque nuit à `WORKER_SYNC_HOUR` (3 h UTC)                                                     |
| `web`     | Conteneur `pixpedia-web` : Nginx qui sert le front statique sous `/pixpedia/` et relaie `/pixpedia/api/` |

Le Nginx du serveur (`nginx-proxy`, `/mnt/docker-volumes/nginx/conf.d/alex2-server.conf`) transmet `/pixpedia/` à `pixpedia-web`, en n'acceptant que les IP de Cloudflare : la limitation de débit de l'API s'appuie sur `CF-Connecting-IP`. Le cookie de session est limité au chemin `/pixpedia/`.

Secrets de prod dans `.env.prod` (jamais commité, même modèle que `.env.example`, plus `COOKIE_PATH=/pixpedia/`).

```bash
# Mettre à jour la prod après des changements
docker compose -f docker-compose.prod.yml up -d --build

# Lancer une commande du worker en prod
docker compose -f docker-compose.prod.yml exec worker node_modules/.bin/tsx apps/worker/src/cli.ts sync
```

## Installation

Prérequis : Node ≥ 22.9, Docker avec Compose, pnpm (via corepack : `corepack enable pnpm`).

```bash
pnpm install
cp .env.example .env      # puis remplir POSTGRES_PASSWORD, DATABASE_URL et les clés Twitch
docker compose up         # postgres, migrations, api, worker, web
```

Les conteneurs utilisent le dépôt monté tel quel : `pnpm install` doit avoir été lancé sur l'hôte.

| Service                  | URL                                     |
| ------------------------ | --------------------------------------- |
| Web (le jeu)             | http://localhost:5186                   |
| Galerie des cartes (dev) | http://localhost:5186/galerie           |
| Animations (dev)         | http://localhost:5186/dev/animations    |
| API via le front         | http://localhost:5186/api/health        |
| API                      | http://localhost:3014/health            |
| PostgreSQL               | `localhost:5436` (127.0.0.1 uniquement) |

## Variables d'environnement

Toutes documentées dans [.env.example](.env.example). Le fichier `.env` n'est jamais commité.

| Variable                                                             | Rôle                                                                 |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Conteneur PostgreSQL                                                 |
| `DATABASE_URL`                                                       | Connexion depuis l'hôte (le compose la remplace dans les conteneurs) |
| `TEST_DATABASE_URL`                                                  | Base des tests d'intégration (vidée à chaque test)                   |
| `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`                           | Application Twitch pour l'API IGDB                                   |
| `IGDB_RPS`, `IGDB_MAX_CONCURRENCY`                                   | Débit IGDB, plafonné à 4 req/s et 8 en parallèle                     |
| `API_PORT`, `CORS_ORIGIN`                                            | API                                                                  |
| `COOKIE_SECURE`, `COOKIE_PATH`                                       | Cookie de session (`/pixpedia/` en prod)                             |
| `PACK_MAX`, `PACK_REGEN_MINUTES`                                     | Stock de packs gratuits et recharge                                  |
| `WEB_PORT`                                                           | Serveur Vite                                                         |
| `WORKER_SYNC_HOUR`                                                   | Heure (UTC) de la sync incrémentale quotidienne                      |

## Commandes

| Commande                                                      | Effet                                                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm worker:probe`                                           | Phase 0 : teste l'accès IGDB, affiche types de jeux, thème Erotic, ESRB AO, plateformes, genres |
| `pnpm worker:import [--limit N] [--after-id N] [--no-series]` | Import complet, paginé par id, puis calcul de la série S0                                       |
| `pnpm worker:sync [--no-series]`                              | Sync incrémentale sur `updated_at`                                                              |
| `pnpm worker:series [--code S0]`                              | Recalcule une série brouillon (refusé si publiée)                                               |
| `pnpm db:generate`                                            | Génère une migration après modification de `packages/db/src/schema.ts`                          |
| `pnpm db:migrate`                                             | Applique les migrations                                                                         |
| `pnpm test`                                                   | Tests Vitest                                                                                    |
| `pnpm test:e2e`                                               | Tests Playwright des animations, dans Docker (le front de dev doit tourner)                     |
| `pnpm typecheck`, `pnpm lint`, `pnpm format`                  | Qualité                                                                                         |

Chaque import affiche un rapport (reçus, nouveaux, inclus, exclus et quarantaine par raison, requêtes, 429, durée) et l'enregistre dans `sync_runs`.

## API

| Méthode | Route                       | Rôle                                                                         |
| ------- | --------------------------- | ---------------------------------------------------------------------------- |
| GET     | `/health`                   | État de l'API et de la base                                                  |
| GET     | `/games?search=`            | Recherche dans le catalogue, avec la carte de la dernière série              |
| POST    | `/auth/register`            | Inscription (`username`, `email`, `password`, `countryCode`, `ageConfirmed`) |
| POST    | `/auth/login`               | Connexion, cookie de session `httpOnly`                                      |
| POST    | `/auth/logout`              | Déconnexion                                                                  |
| GET     | `/me`                       | Profil, stock de packs, prochaine recharge, monnaies, réglages               |
| PATCH   | `/me/settings`              | Réglages du profil (`reducedMotion`)                                         |
| POST    | `/me/hof-seen`              | Premier Hall of Fame vu (le saut de son animation était bloqué)              |
| GET     | `/packs`                    | Types de packs et taux de drop publiés                                       |
| POST    | `/packs/open`               | Ouvre un pack (`packTypeId`, `idempotencyKey` UUID, `useShards`)             |
| GET     | `/collection`               | Cartes possédées (`page`, `pageSize`, `rarity`, `family`, `search`, `sort`)  |
| GET     | `/collection/duplicates`    | Doublons recyclables et éclats qu'ils rapporteraient                         |
| GET     | `/cards/:id`                | Détail d'une carte et exemplaires possédés                                   |
| POST    | `/cards/recycle`            | Recycle des doublons d'une carte (`cardId`, `finish`, `quantity`)            |
| POST    | `/cards/recycle-duplicates` | Recycle tous les doublons libres                                             |
| GET     | `/sets?type=`               | Sets d'un type avec la progression (`search`, `sort`, `page`)                |
| GET     | `/sets/summary`             | Sets commencés et complétés par type                                         |
| GET     | `/sets/:type/:key`          | Cartes d'un set, possédées ou manquantes (`missing=all\|owned\|missing`)     |
| GET     | `/drops/hof`                | Annonces « pseudo a tiré Jeu » (`since`, `limit`)                            |

## Tests

`pnpm test` lance les tests unitaires et les tests d'intégration de l'API. Ces derniers ont besoin d'une base dédiée, vidée à chaque test :

```bash
docker compose exec postgres createdb -U pixpedia pixpedia_test   # une seule fois
# puis TEST_DATABASE_URL dans .env
```

Sans `TEST_DATABASE_URL`, les tests d'intégration sont ignorés.

## Exemple

```bash
pnpm worker:import --limit 500
curl 'http://localhost:3014/games?search=zelda'
```

Projet non officiel, sans lien avec les éditeurs. Données : [IGDB.com](https://www.igdb.com).
