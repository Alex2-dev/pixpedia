# Pixpedia — règles du projet

Jeu web de cartes à collectionner, chaque carte = un jeu vidéo réel (IGDB). Studio Alex² (GIE, 2 devs).
Spec : `docs/spec.md` (v1.5). **Les règles ci-dessous priment sur la spec.** Décisions : `docs/decisions.md`.

## Stack et commandes

- Monorepo pnpm : `apps/{web,api,worker}`, `packages/{shared,db}`. TypeScript strict, ESLint, Prettier, Vitest.
- Les paquets internes exportent leur `src/*.ts` directement (pas de build), exécutés via `tsx`.
- Dev : `docker compose up` (pnpm install sur l'hôte avant). Ports hôte : Postgres 5436, API 3014, web 5186.
- **Prod en ligne** : https://alex2-server.fr/pixpedia/ via `docker-compose.prod.yml` (secrets `.env.prod`). Mise à jour : `docker compose -f docker-compose.prod.yml up -d --build`. Ne jamais tester avec des comptes dans la base de prod sans les supprimer ensuite.
- `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm worker:{probe,import,sync,series}`, `pnpm db:{generate,migrate}`.
- Toute logique de calcul va dans `packages/shared`, en fonctions pures, **avec tests Vitest**.
- Tests d'intégration API sur la base `pixpedia_test` (`TEST_DATABASE_URL`), regroupés dans `apps/api/src/*.int.test.ts`.
- Schéma : `packages/db/src/schema.ts` puis `pnpm db:generate`. Jamais de modification manuelle de la base en prod.

## Règles de jeu

- **Raretés** (clé / nom / couleur / coût) : `starter` Starter #8A93A6 1, `bonus` Bonus #3FB27F 2, `combo` Combo #3D8BFF 3,
  `boss` Boss #A05CFF 4, `final` Boss final #FF8A3D 5, `hof` Hall of Fame (holo, dégradé) 6. Source : `packages/shared/src/constants.ts`.
- Rareté = **score de prestige** : `WR = (v/(v+m))·R + (m/(v+m))·C`, `score = WR × log10(1 + v)`, `m = 50`.
  Classement **par décennie**, seuils en percentiles (`DEFAULT_RARITY_PARAMS`). Sans note → Starter.
- **Rareté figée par série** (`series.released_at` non nul = figée). La cote hebdo (`games.prestige_score`) est affichée seulement.
- **Stats** en percentiles 10–99 : ATK = note, DEF = nb de votes, PV = temps de jeu, VIT = inverse du temps de jeu.
  Défauts : ATK 40 sans note, PV/VIT 50 sans durée. **Figées à la création de la carte.**
- **Familles** (depuis les genres IGDB) : Action, Stratégie, Vitesse, Aventure, RPG.
  Cycle Action > Stratégie > Vitesse > Aventure > RPG > Action, +20 % de dégâts.
- Le **système de combat n'est pas tranché** : ne pas le coder. Champ `cards.combat` (jsonb) réservé.
- Tirage : taux par emplacement dans `pack_types.odds`, `draw_pool` reconstruit dans la transaction du calcul de série. Hasard via `crypto.randomInt` uniquement.
- Sets (8 types : plateforme, décennie, année, genre, thème, développeur, éditeur, franchise) et packs thématiques (pool = un set) reconstruits avec la série.
- Éclats : gagnés en recyclant des doublons libres, jamais achetés. Une carte liée ne se recycle jamais.
- Exclusion du contenu sexuel (spec §4) : `eligible` / `quarantine` / `excluded`, en cas de doute quarantaine.

## Argent — non négociable

- Chaque carte possédée a `is_bound` (liée = non revendable). Les packs gratuits donnent des cartes libres.
- **Règle JONUM : on ne peut jamais payer pour obtenir au hasard une carte revendable.** Payant + aléatoire ⇒ cartes liées.
- Paiements **en France uniquement** au lancement (`country_features`). Aucun paiement codé pour l'instant.

## Sécurité et qualité

- Secrets (`TWITCH_*`, `DATABASE_URL`, …) dans `.env` uniquement, jamais dans le code ni git.
- Auth : email + mot de passe (argon2id), sessions en base (jeton haché), 15 ans minimum, email non vérifié pour l'instant.
- Entrées validées avec zod. IGDB : jamais plus de 4 req/s ni 8 requêtes en parallèle (plafond codé dans `apps/worker/src/config.ts`).
- Commits petits, clairs, **en français**.

## Direction artistique

- Sombre, gaming, pixel. Encre #120E1A, Pierre #1E1828, Ombre #2E2639, Parchemin #EADFC8, Cendre #A79DB3, Rune #4FE3D1.
- Police pixel **Silkscreen** pour labels et chiffres, Cinzel pour les titres, Alegreya Sans pour le texte.
- Composant carte : `apps/web/src/card/` (porté du design `pixpedia-carte.html`). Galerie de contrôle sur `/galerie` en dev.
- Le front appelle l'API sur `/api` (même origine : proxy Vite en dev, Nginx en prod).
- Ombres dures en pixel, pas de halos flous.
- 3D et animations en CSS (`transform`, `opacity`) + Motion + @use-gesture. Toujours respecter `prefers-reduced-motion`.
