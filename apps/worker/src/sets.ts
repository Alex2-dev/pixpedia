import { sql } from 'drizzle-orm';
import type { Db } from '@pixpedia/db';
import { SET_TYPES, type SetType } from '@pixpedia/shared';

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export type SetsSummary = Record<SetType, number>;

/**
 * Reconstruit les sets d'une série : plateforme, décennie, année, genre, thème,
 * développeur, éditeur, franchise. Seules les cartes de jeux éligibles comptent.
 * Les petits sets (sociétés ou franchises d'un ou deux jeux) ne sont pas créés.
 */
export async function rebuildSets(tx: Tx, seriesId: number): Promise<SetsSummary> {
  await tx.execute(
    sql`delete from set_cards where set_id in (select id from sets where series_id = ${seriesId})`,
  );
  await tx.execute(sql`delete from sets where series_id = ${seriesId}`);

  await tx.execute(sql`
    create temp table tmp_set_rows (type text, key text, name text, card_id int) on commit drop
  `);
  await tx.execute(sql`
    insert into tmp_set_rows
    with sc as (
      select c.id as card_id, g.id as game_id, g.release_decade, g.first_release_date
      from cards c join games g on g.id = c.game_id
      where c.series_id = ${seriesId} and g.status = 'eligible'
    )
    select 'platform', p.slug, p.name, sc.card_id
      from sc join game_platforms gp on gp.game_id = sc.game_id
      join platforms p on p.id = gp.platform_id and p.is_official
    union all
    select 'decade', sc.release_decade::text,
           'Années ' || case when sc.release_decade < 2000 then (sc.release_decade % 100)::text
                             else sc.release_decade::text end,
           sc.card_id
      from sc where sc.release_decade is not null
    union all
    select 'year', extract(year from sc.first_release_date)::text,
           extract(year from sc.first_release_date)::text, sc.card_id
      from sc where sc.first_release_date is not null
    union all
    select 'genre', ge.slug, ge.name, sc.card_id
      from sc join game_genres gg on gg.game_id = sc.game_id join genres ge on ge.id = gg.genre_id
    union all
    select 'theme', t.slug, t.name, sc.card_id
      from sc join game_themes gt on gt.game_id = sc.game_id join themes t on t.id = gt.theme_id
    union all
    select gc.role, co.slug, co.name, sc.card_id
      from sc join game_companies gc on gc.game_id = sc.game_id join companies co on co.id = gc.company_id
    union all
    select 'franchise', f.slug, f.name, sc.card_id
      from sc join game_franchises gf on gf.game_id = sc.game_id join franchises f on f.id = gf.franchise_id
  `);

  const minSizes = sql.join(
    SET_TYPES.map((t) => sql`(${t.type}::text, ${t.minSize}::int)`),
    sql`, `,
  );
  await tx.execute(sql`
    insert into sets (series_id, type, key, name, total)
    select ${seriesId}, r.type, r.key, min(r.name), count(distinct r.card_id)
    from tmp_set_rows r
    join (values ${minSizes}) as m(type, min_size) on m.type = r.type
    group by r.type, r.key, m.min_size
    having count(distinct r.card_id) >= m.min_size
  `);
  await tx.execute(sql`
    insert into set_cards (set_id, card_id)
    select distinct s.id, r.card_id
    from tmp_set_rows r
    join sets s on s.series_id = ${seriesId} and s.type = r.type and s.key = r.key
  `);

  const { rows } = await tx.execute<{ type: SetType; n: number }>(
    sql`select type, count(*)::int as n from sets where series_id = ${seriesId} group by type`,
  );
  const summary = Object.fromEntries(SET_TYPES.map((t) => [t.type, 0])) as SetsSummary;
  for (const r of rows) summary[r.type] = r.n;
  return summary;
}
