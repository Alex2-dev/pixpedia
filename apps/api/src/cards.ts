import { sql } from 'drizzle-orm';
import type { Db } from '@pixpedia/db';
import {
  FAMILY_LABELS,
  RARITIES,
  cardNumber,
  igdbCoverUrl,
  type CardView,
  type Family,
  type Rarity,
} from '@pixpedia/shared';

interface CardViewRow extends Record<string, unknown> {
  card_id: number;
  number: number;
  game_id: number;
  series_code: string;
  name: string;
  first_release_date: string | null;
  cover_image_id: string | null;
  platform: string | null;
  rarity: Rarity;
  family: Family;
  atk: number;
  def: number;
  hp: number;
  spd: number;
}

export function toCardView(r: CardViewRow): CardView {
  return {
    cardId: r.card_id,
    gameId: r.game_id,
    number: cardNumber(r.number),
    seriesCode: r.series_code,
    name: r.name,
    year: r.first_release_date ? Number(String(r.first_release_date).slice(0, 4)) : null,
    platform: r.platform,
    rarity: r.rarity,
    rarityLabel: RARITIES[r.rarity].label,
    cost: RARITIES[r.rarity].cost,
    family: r.family,
    familyLabel: FAMILY_LABELS[r.family],
    atk: r.atk,
    def: r.def,
    hp: r.hp,
    spd: r.spd,
    coverUrl: r.cover_image_id ? igdbCoverUrl(r.cover_image_id) : null,
  };
}

/**
 * Vues complètes des cartes demandées, une seule requête.
 * Plateforme principale : la plateforme officielle d'id IGDB le plus petit (souvent la plateforme d'origine).
 */
export async function loadCardViews(db: Db, cardIds: number[]): Promise<Map<number, CardView>> {
  if (!cardIds.length) return new Map();
  const { rows } = await db.execute<CardViewRow>(sql`
    select c.id as card_id, c.number, g.id as game_id, s.code as series_code, g.name, g.first_release_date::text,
           g.cover_image_id, c.rarity, c.family, c.atk, c.def, c.hp, c.spd,
           (select coalesce(p.abbreviation, p.name) from game_platforms gp
              join platforms p on p.id = gp.platform_id
             where gp.game_id = g.id and p.is_official
             order by p.id limit 1) as platform
    from cards c
    join games g on g.id = c.game_id
    join series s on s.id = c.series_id
    where c.id = any(${sql.param(cardIds)}::int[])
  `);
  return new Map(rows.map((r) => [r.card_id, toCardView(r)]));
}
