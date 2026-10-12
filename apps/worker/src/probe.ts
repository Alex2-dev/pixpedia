import { GENRE_FAMILY, platformFamily } from '@pixpedia/shared';
import type { IgdbClient } from './igdb/client';
import { GAME_FIELDS, type IgdbGame, type IgdbPlatform, type IgdbRef } from './igdb/types';

/**
 * Phase 0 (spec §16) : vérifie l'accès IGDB et affiche les valeurs réelles
 * sur lesquelles reposent les filtres (types de jeux, thème Erotic, ESRB AO, plateformes, genres).
 */
export async function probe(igdb: IgdbClient, log: (m: string) => void): Promise<void> {
  const [gameTypes, themes, genres, platforms, ageCategories, minecraft] = await Promise.all([
    igdb.query<{ id: number; type: string }>(
      'game_types',
      'fields id,type; sort id asc; limit 50;',
    ),
    igdb.query<IgdbRef>('themes', 'fields id,name,slug; sort id asc; limit 100;'),
    igdb.query<IgdbRef>('genres', 'fields id,name,slug; sort id asc; limit 100;'),
    igdb.query<IgdbPlatform>(
      'platforms',
      'fields id,name,slug,abbreviation; sort id asc; limit 500;',
    ),
    igdb.query<{ id: number; rating: string; organization?: { name: string } }>(
      'age_rating_categories',
      'fields id,rating,organization.name; sort id asc; limit 100;',
    ),
    igdb.query<IgdbGame>('games', `fields ${GAME_FIELDS}; where slug = "minecraft-java-edition";`),
  ]);

  log('\n== Types de jeux (game_types) ==');
  for (const t of gameTypes) log(`  ${String(t.id).padStart(3)}  ${t.type}`);

  log('\n== Thèmes ==');
  const erotic = themes.find((t) => t.slug === 'erotic');
  log(`  ${themes.length} thèmes. Erotic : ${erotic ? `id ${erotic.id}` : 'INTROUVABLE'}`);

  log('\n== Genres → familles ==');
  for (const g of genres) {
    log(
      `  ${String(g.id).padStart(3)}  ${g.slug.padEnd(30)} ${GENRE_FAMILY[g.slug] ?? '(ignoré)'}`,
    );
  }

  log('\n== Classifications ESRB ==');
  const esrb = ageCategories.filter((c) => c.organization?.name === 'ESRB');
  log(`  ${esrb.map((c) => `${c.rating} (${c.id})`).join(', ') || 'aucune'}`);
  log(`  Adults Only : ${esrb.some((c) => c.rating === 'AO') ? 'trouvé' : 'INTROUVABLE'}`);

  log('\n== Plateformes ==');
  const official = platforms.filter((p) => platformFamily(p.slug));
  log(`  ${platforms.length} plateformes, ${official.length} dans la liste blanche :`);
  log(`  ${official.map((p) => p.slug).join(', ')}`);
  log(
    `  Hors liste blanche : ${platforms
      .filter((p) => !platformFamily(p.slug))
      .map((p) => p.slug)
      .join(', ')}`,
  );

  log('\n== Échantillon : Minecraft: Java Edition ==');
  const mc = minecraft[0];
  if (mc) {
    log(`  total_rating = ${mc.total_rating} (attendu ≈ 84,8, échelle sur 100)`);
    log(`  total_rating_count = ${mc.total_rating_count}`);
    log(`  game_type = ${mc.game_type}, cover = ${mc.cover?.image_id}`);
    const ttb = await igdb.query<{ normally?: number }>(
      'game_time_to_beats',
      `fields normally; where game_id = ${mc.id};`,
    );
    log(`  time to beat (normally) = ${ttb[0]?.normally ?? 'inconnu'} s`);
  } else {
    log('  introuvable');
  }
  log(`\nRequêtes IGDB : ${igdb.stats.requests}`);
}
