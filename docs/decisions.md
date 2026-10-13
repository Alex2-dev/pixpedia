# Décisions

Décisions prises en cours de développement, en complément de la spec (`spec.md`). Les plus récentes en premier.

## 2026-10-13 — Animations d'ouverture et de drop

Référence exacte : `docs/design/pixpedia-animations.html` (timelines et keyframes repris tels quels).

- **Ouverture** (`apps/web/src/features/pack-opening/`) : idle → déchirure → révélation → récap. Déchirure 1,75 s pour 1 pack ; à plusieurs packs, un pack toutes les 0,38 s en version accélérée (3,26 s pour 7). Carte face cachée seule au centre, qui respire ; 1er toucher retourne (ou lance le drop), 2e passe à la suivante ; la plus rare de chaque pack sort en dernier. « Tout révéler » mène au récap.
- « Ouvrir 7 packs » de la maquette généralisé en **« Ouvrir mes N packs »** (2 à 10 selon le stock) : N ouvertures côté serveur, chacune avec sa clé d'idempotence, toutes gardées dans l'historique (un rechargement ne consomme rien). Pas de changement d'API.
- La déchirure au doigt (V2) se branchera sur `TearDriver` ; seule la déchirure automatique existe.
- **Drops** (`apps/web/src/components/drop/`) : Boss ~1,4 s, Boss final ~3 s, Hall of Fame ~4,5 s. Keyframes de la maquette renommés avec un préfixe par animation (`bs`, `ff`, `h`), les noms communs des iframes s'écrasant sinon. Correspondance rareté → animation dans `getRevealAnimation` (`packages/shared`).
- CSS + un hook à minuteries (`useDropSequence`), sans bibliothèque d'animation : `motion` a été retiré.
- **Saut** : un toucher amène les animations ponctuelles à leur état final, les boucles (halos, braises, confettis, bandeau) continuent. « Tout révéler » saute tout. Premier Hall of Fame : saut bloqué 1,5 s, mémorisé côté serveur (`users.first_hof_seen_at`).
- **Animations réduites** : `prefers-reduced-motion` ou option du profil (`users.reduced_motion`, page Réglages). État final en fondu de 0,3 s, sans secousse, flash ni rotation.
- **Écarts validés avec la maquette** :
  - Hall of Fame : 40 particules visibles au maximum (une particule sur deux par salve de feux d'artifice, 16 confettis au lieu de 40). Particules extraites de la maquette (`particles.ts`, généré).
  - Pourcentages calculés depuis les vrais taux du pack (Boss 5,4 % · 1 sur 19, Boss final 1,6 % · 1 sur 63, Hall of Fame 0,2 % · 1 sur 500) au lieu des valeurs d'exemple.
  - « Ajouter au codex » mène au codex : les cartes y sont déjà depuis l'ouverture (tirage côté serveur). « Classeur » est renommé « Codex » (`/classeur` redirige).
  - « Rejouer » rouvre le même nombre de packs si le stock le permet, sinon retour à l'accueil.
  - **Plein écran, sans cadre** (demande de l'équipe après essai sur ordinateur) : fonds, chaleur, flashs, confettis et bandeau couvrent toute la fenêtre ; la carte, les anneaux, les particules et les titres gardent les positions de la maquette (390 × 844) dans un cœur centré, mis à l'échelle de l'écran (`.dp-core`). L'ouverture laisse aussi déborder ses rayons et halos.
  - Récap : vraies cartes réduites à 104 px au lieu de la mini-carte simplifiée.
  - Bouton ✕ ajouté sur l'écran du pack fermé, pour revenir sans ouvrir.
- **Fiche carte** : « ▶ Voir l'animation de drop » pour Boss et plus, visible même sans posséder la carte ; « Tirée le JJ/MM/AAAA » si possédée (pour toutes les raretés).
- **Annonce Hall of Fame** : événement `card_drop_hof` (table `drop_events`) écrit à l'ouverture, lu par `GET /drops/hof` ; composant `HofBanner` prêt. Le temps réel (SSE ou WebSocket) reste à faire.
- **Sons** : signaux `onCue` (`rumble`, `crack`, `impact`, `explode`, `slam`, `crown`, `title`, `fanfare`, `firework`, `trophy`) aux moments clés, sans fichier audio.
- **Tests** : Vitest (`getRevealAnimation`, séquence de drop, ordre de révélation) et Playwright dans l'image Docker officielle (`pnpm test:e2e`, Arch Linux n'étant pas pris en charge). Les clics sur les cartes qui respirent sont forcés dans les tests, Playwright attendant sinon qu'elles s'immobilisent.

## 2026-10-13 — Mise en ligne sur alex2-server.fr/pixpedia

- Pile de production séparée du dev : base dédiée (catalogue copié depuis le dev, sans aucun compte), API sans rechargement à chaud, front en build statique servi par Nginx. Le serveur Vite de dev n'est jamais exposé.
- Front construit avec `VITE_BASE=/pixpedia/` : routes, API (`/pixpedia/api`), manifeste et service worker sous ce chemin. En dev, tout reste à la racine.
- L'origine `/pixpedia/` n'accepte que Cloudflare (`cloudflare-allow.inc`), ce qui rend `CF-Connecting-IP` fiable pour limiter le débit par joueur ; sinon tous les joueurs partageraient les IP de Cloudflare.
- Cookie de session limité à `/pixpedia/` : le domaine héberge d'autres applications qui ne doivent pas le recevoir.
- Syncs IGDB décalées (dev 4 h, prod 3 h UTC) pour ne jamais dépasser 4 requêtes/s à deux.
- Correctif trouvé en ligne : recharger la page d'ouverture ouvrait un nouveau pack. La clé d'idempotence est maintenant créée au clic et gardée dans l'historique du navigateur.
- À faire avant d'ouvrir largement (spec §21.1) : mentions légales, politique de confidentialité, CGU, suppression de compte.

## 2026-10-13 — Phase 5 : sets, packs thématiques, éclats

- **Sets** sur 8 dimensions, à la demande de l'équipe : plateforme, décennie, année, genre, thème, développeur, éditeur, franchise. Une carte compte dans tous ses sets.
- Éditeurs et franchises désormais importés d'IGDB (`companies`, `game_companies` avec le rôle, `franchises`, `game_franchises`).
- Taille minimum d'un set : 5 cartes pour développeurs et éditeurs, 3 pour les franchises, aucune pour les autres types. Sinon des milliers de sets d'un seul jeu.
- Les sets sont reconstruits avec la série, dans la même transaction que le pool. Seuls les jeux éligibles comptent. La progression est calculée en partant des cartes du joueur (le set « PC » contient plus de 100 000 cartes).
- Cartes manquantes affichées en silhouette : numéro, nom, année et rareté visibles, pas la jaquette.
- **Packs thématiques** : un pack thématique est un pack dont le pool est un set (`pack_types.filter = {set: {type, key}}`). 10 packs de départ à 100 éclats (années 80, 90, 2000, RPG, Plateforme, Horreur, N64, PS2, Final Fantasy, FromSoftware). Mêmes taux de drop que le standard ; désactivé automatiquement si son set a moins de 5 cartes.
- Repli de rareté : si une rareté manque au pool, on essaie en dessous puis au-dessus (avant : en dessous seulement).
- **Recyclage** (spec §5.6) : Starter 1, Bonus 3, Combo 10, Boss 40, Boss final 150, Hall of Fame 500 éclats par doublon. Un exemplaire de chaque carte et finition est toujours gardé. Les cartes liées ne se recyclent jamais (spec §17.4). Chaque mouvement est tracé dans `currency_ledger`.
- **Pack standard en plus** : 50 éclats quand le stock gratuit est vide. Les éclats se gagnent uniquement en jouant : aucun argent réel, les cartes obtenues restent libres (règle JONUM respectée).

## 2026-10-13 — Phase 4 : front de jeu

- Composant carte porté fidèlement depuis le design `pixpedia-carte.html` (6 raretés, variante VIP, carte d'événement, verso), dans `apps/web/src/card/`. Taille de référence 240 × 336, les autres tailles sont obtenues par `transform: scale`.
- Police pixel : **Silkscreen** (celle du design), à la place de Press Start 2P.
- Finitions, absentes du design : le reflet `.foil` du design sur l'illustration, plus une étiquette HOLO ou FULL ART. À revoir si un design dédié arrive.
- VIP et cartes d'événement : rendus prêts, aucune donnée ne les utilise encore.
- Numéro de carte : rang dans la série par id IGDB croissant (`cards.number`), figé avec la série.
- Plateforme affichée : la plateforme officielle d'id IGDB le plus petit (souvent la plateforme d'origine).
- Le front appelle l'API via `/api` sur la même origine (proxy Vite en dev, Nginx en prod) : pas de CORS, le cookie de session suit.
- Écrans : accueil (stock, compte à rebours, taux de drop publiés), ouverture (révélation carte par carte, « tout révéler », éclat à partir de Boss), classeur (filtres, tri, pagination), détail (carte en grand, résumé, plateformes, exemplaires, lien IGDB), connexion et inscription. Galerie `/galerie` en dev seulement.
- Le recalcul d'une série brouillon met les cartes à jour sur place au lieu de les recréer : les id restent stables et une carte possédée n'est jamais supprimée (spec §3.4). Avant cette correction, la sync nocturne aurait échoué dès la première carte possédée.
- Les résumés des jeux viennent d'IGDB, donc en anglais.

## 2026-10-13 — Phase 3 : comptes, ouverture de packs, collection

- Connexion par **email + mot de passe seulement** (décision ouverte n°6). Discord ou Twitch plus tard.
- **15 ans minimum** (décision ouverte n°20) : case obligatoire à l'inscription, date enregistrée dans `users.age_confirmed_at`.
- **Vérification d'email préparée, pas active** : colonne `users.email_verified_at`, aucun envoi de mail tant qu'il n'y a pas de SMTP.
- Mots de passe en argon2id (19 Mio, 2 passes, recommandation OWASP). Un email inconnu coûte le même temps qu'un mauvais mot de passe.
- Sessions en base (`sessions`) : seul le SHA-256 du jeton est stocké, le jeton vit dans un cookie `httpOnly`, `Secure`, `SameSite=Lax`, valable 30 jours. Pas de `SESSION_SECRET` nécessaire.
- Pseudo et email uniques sans tenir compte de la casse. Pays déclaré obligatoire à l'inscription.
- Limites de débit par IP : inscription 5 par heure, connexion 10 par minute, ouverture 30 par minute.
- Ouverture de pack : transaction de la spec §8.3, verrou `FOR UPDATE` sur le joueur, clé d'idempotence (le même tirage est renvoyé en cas de double clic). Les packs gratuits donnent des **cartes libres** (`is_bound = false`).
- Une carte est « nouvelle » si le joueur ne la possédait dans aucune finition.
- Base de test séparée `pixpedia_test` (`TEST_DATABASE_URL`) pour les tests d'intégration ; ils sont ignorés si la variable est absente.

## 2026-10-13 — Phase 2 : tirage

- Taux de drop du pack standard repris de la spec §5.4 avec les raretés Pixpedia (Commun→Starter, Peu commun→Bonus, Rare→Combo, Épique→Boss, Ultra rare→Boss final, Légendaire→Hall of Fame) :
  emplacements 1-3 Starter 75 / Bonus 22 / Combo 3 ; emplacement 4 Bonus 70 / Combo 24 / Boss 5 / Boss final 1 ; emplacement 5 Combo 70 / Boss 22 / Boss final 7 / Hall of Fame 1.
- Garantie : après 10 packs sans Boss ou mieux, l'emplacement 5 est Boss au minimum.
- Taux stockés dans `pack_types.odds` (jsonb validé par zod), valeurs de départ dans `DEFAULT_PACK_ODDS`. Tirage en dix-millièmes, avec un entier aléatoire fourni par l'appelant (`crypto.randomInt` côté serveur).
- `draw_pool` reconstruit **dans la même transaction** que le recalcul de la série : les joueurs ne voient jamais un pool vide ni des cartes supprimées. Seuls les jeux `eligible` et `is_drawable` de la série la plus récente y entrent.
- Index sur `draw_pool.card_id` : sans lui, recalculer une série prenait plusieurs minutes (vérification de clé étrangère sur tout le pool).
- Seul le pack standard existe. Les packs filtrés (thématiques) sont refusés jusqu'à la phase 5.
- À surveiller en bêta : avec 1 pack toutes les 5 minutes, un joueur très actif peut ouvrir jusqu'à 288 packs par jour, soit environ 3 Hall of Fame par jour.

## 2026-10-13 — Premier import complet

- 277 119 jeux reçus en 9 min 44 s, 1 113 requêtes IGDB, aucun 429.
- 196 053 inclus, 80 199 exclus (sans date 47 191, plateforme 19 411, thème Erotic 9 684, à venir 3 889, ESRB AO 19, sans jaquette 5), 867 en quarantaine (surtout le tag « nsfw » sur des visual novels adultes).
- Série S0 : 135 Hall of Fame, 565 Boss final, 1 025 Boss, 2 559 Combo, 21 311 Bonus, 170 458 Starter (87 % des jeux n'ont aucune note). Moyenne C = 68,0.
- Test visuel du top par décennie (spec §5.2) : validé, les Hall of Fame sont les classiques attendus.

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

- Population de référence : les jeux éligibles de la série **qui ont la donnée** (pas par décennie). Pour DEF, seulement les jeux avec au moins 1 vote : avec les 170 000 jeux sans vote dans la population, tout jeu noté dépassait le 87e percentile et DEF valait 99 partout.
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

- `indie` est ignoré. `puzzle` est un genre **secondaire** : il ne compte que si le jeu n'a aucun autre genre reconnu (sur les 500 premiers jeux, Stratégie faisait 40 % des cartes, Skyward Sword et Portal y tombaient). Famille majoritaire parmi les genres. Égalité : RPG > Stratégie > Aventure > Vitesse > Action. Sans genre reconnu : Action.
- Correspondance par **slug** (stable) et non par id.

### Catalogue

- Types de jeux inclus : jeu principal (0), remake (8), remaster (9), chacun avec sa propre carte (décision ouverte n°4). Portages, DLC, extensions, bundles, mods exclus. Réglable dans `INCLUDED_GAME_TYPES`.
- Plateformes historiques incluses (décision ouverte n°5) : Arcade, Atari, Neo Geo, Amiga, plus DOS dans la famille PC. Liste blanche par slug dans `packages/shared/src/platforms.ts`, vérifiée avec `pnpm worker:probe` le 2026-10-12 (56 plateformes reconnues sur 220).
- Jeu sans date de sortie : exclu avec la raison `inclusion:no_release_date` (47 191 jeux au premier import complet), distincte de `inclusion:unreleased` (date future, reclassé automatiquement à sa sortie).
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
