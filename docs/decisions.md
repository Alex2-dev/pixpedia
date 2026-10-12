# Décisions

Décisions prises en cours de développement, en complément de la spec (`spec.md`). Les plus récentes en premier.

## 2026-10-12 — Phases 0 et 1 (socle + catalogue)

### Identité et règles qui priment sur la spec

- Le jeu s'appelle **Pixpedia** (décision ouverte n°1 tranchée pour le nom).
- Raretés Starter → Hall of Fame (6 paliers) à la place de Commun → Légendaire. Correspondance : C→Starter, U→Bonus, R→Combo, E→Boss, UR→Boss final, L→Hall of Fame.
- Stats en percentiles 10–99 (ATK, DEF, PV, VIT) à la place des formules de la spec §5.3.
- Débit IGDB : **4 req/s** (au lieu des 3 de la spec §3.4) et 8 requêtes en parallèle, plafonds non dépassables par configuration.

### Rareté

- Seuils par décennie, en part des jeux notés : Hall of Fame 0,5 %, Boss final 2 %, Boss 4 %, Combo 10 %, Bonus le reste. Jeux sans note (ou sans vote) : Starter.
- Minimums par décennie gardés de la spec (10 Hall of Fame, 60 Boss final), plafonnés à 5 % et 15 % de la décennie pour les petites décennies.
- Égalité de score : le jeu le plus voté passe devant, puis l'id le plus petit (déterministe).
- `C` = moyenne des notes des jeux éligibles notés, recalculée à chaque série.
- Les `rarity_overrides` relèvent une rareté sans prendre de place dans les quotas, et ne la baissent jamais.
- Rareté stockée en texte (`starter`…`hof`) avec contrainte CHECK, plutôt qu'en smallint.

### Séries

- `pnpm worker:import` et `sync` recalculent la série brouillon **S0** à la fin. Une série dont `released_at` est rempli est figée : le worker refuse de la recalculer.
- Une série brouillon est recalculée entièrement (suppression puis recréation de ses cartes). Possible tant qu'aucune carte n'est possédée par un joueur.

### Stats

- Population de référence : tous les jeux éligibles de la série (pas par décennie).
- Ex æquo : même stat. La plus petite valeur donne 10, la plus grande 99.
- Valeurs par défaut : ATK 40 sans note (un jeu non noté est en général obscur), PV et VIT 50 sans durée de jeu. DEF n'est jamais manquante (0 vote = 10).
- Temps de jeu : champ `normally` de `game_time_to_beats`.

### Familles

| Famille   | Genres IGDB (slug)                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Action    | fighting, shooter, hack-and-slash-beat-em-up, arcade, pinball                                                                  |
| Stratégie | real-time-strategy-rts, strategy, turn-based-strategy-tbs, tactical, moba, card-and-board-game, puzzle, quiz-trivia, simulator |
| Vitesse   | racing, sport, platform, music                                                                                                 |
| Aventure  | adventure, point-and-click, visual-novel                                                                                       |
| RPG       | role-playing-rpg                                                                                                               |

- `indie` est ignoré. Famille majoritaire parmi les genres. Égalité : RPG > Stratégie > Aventure > Vitesse > Action. Sans genre reconnu : Action.
- Correspondance par **slug** (stable) et non par id.

### Catalogue

- Types de jeux inclus : jeu principal (0), remake (8), remaster (9), chacun avec sa propre carte (décision ouverte n°4). Portages, DLC, extensions, bundles, mods exclus. Réglable dans `INCLUDED_GAME_TYPES`.
- Plateformes historiques incluses (décision ouverte n°5) : Arcade, Atari, Neo Geo, Amiga, plus DOS dans la famille PC. Liste blanche par slug dans `packages/shared/src/platforms.ts`, à confirmer avec `pnpm worker:probe`.
- L'import complet ne demande à IGDB que les jeux des types retenus avec jaquette. Les jeux non sortis ou sans plateforme de la liste blanche sont stockés en `excluded` avec une raison `inclusion:*`. Un jeu non sorti est reclassé automatiquement quand sa date passe.
- La sync incrémentale prend tous les jeux modifiés (sans filtre de type ni de jaquette), pour pouvoir aussi exclure un jeu qui change.
- Point de départ de la sync : `max(games.igdb_updated_at)`.
- Mots-clés, descripteurs de contenu et ESRB AO sont stockés sur `games` pour reclasser sans rappeler IGDB.

### Exclusion du contenu sexuel

- Ordre des règles : liste noire (R5), thème Erotic (R1), ESRB Adults Only (R2) ⇒ exclu ; puis critères d'inclusion ; puis mots-clés (R3) et « Strong Sexual Content » avec moins de 10 votes (R4) ⇒ quarantaine.
- R4 : la « faible popularité » est mesurée par `total_rating_count < 10`, sans appel à `popularity_primitives`.
- R3 : recherche en mots entiers (pas de faux positif sur « Hero » ou « Essex »). Liste complète (sex, nudity…) dans le **nom** seulement. Dans les **keywords IGDB**, seuls les termes explicites comptent (hentai, eroge, porn, nsfw, 18+…) : au premier import réel, les tags « sex work » et « nudity » mettaient en quarantaine BioShock, Mass Effect 2, God of War, etc. (58 jeux sur 500).
- Identifiants ESRB / thème résolus par leur nom ou slug via des champs IGDB étendus, jamais codés en dur.

### Technique

- Paquet `packages/db` ajouté (schéma partagé entre api et worker).
- Tables créées dès maintenant : catalogue, `series`, `cards`, `rarity_overrides`, `blocked_games`, `sync_runs`, `country_features` (vide).
- **Reportées à la phase 3 (auth)** : `users` (avec `shards` et `coins`), `user_cards` (avec `is_bound`), `currency_ledger`, `pack_*`, `draw_pool`.
- Recherche `GET /games` : `pg_trgm` (ILIKE + similarité), jeux éligibles uniquement, avec la carte de la série la plus récente.
- Docker de dev : image `node:22-bookworm-slim`, dépôt monté, `pnpm install` sur l'hôte. Ports hôte liés à 127.0.0.1.
- TypeScript 6.0 (et pas 7) : typescript-eslint ne supporte pas encore TS 7.
- Icône PWA en SVG seulement pour l'instant ; PNG 192/512 à ajouter avant la mise en ligne.
