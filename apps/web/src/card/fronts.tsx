import type { CSSProperties, ReactNode } from 'react';
import { getCardBack } from '@pixpedia/shared';
import { CardBackOf } from './backs';
import { ArenaFront, FullArtFront, HoloOverlay } from './editions';
import { Lock, Logo, Px, Scene, Wordmark, step } from './pixel';
import { FAMILY_TEXT, RARITY_STYLE, type CardData, type RarityStyle } from './types';

const SHADOW = 'drop-shadow(3px 3px 0 rgba(0,0,0,.5))';
const DEPTH = 'drop-shadow(0 20px 26px rgba(0,0,0,.5))';
const glow = (c: string) => `${SHADOW} drop-shadow(0 0 ${c}) ${DEPTH}`;
const abs = (s: CSSProperties): CSSProperties => ({ position: 'absolute', ...s });

interface PartsOptions {
  ring?: string;
  statCell?: CSSProperties;
  statVal?: string;
  badgeBg?: string;
}

/** Morceaux communs à tous les designs (illustration, badge, coût, stats, pied). */
function parts(d: CardData, R: RarityStyle, o: PartsOptions = {}) {
  const ring = o.ring ?? R.color;
  const meta = [d.year, d.platform?.toUpperCase(), d.family ? FAMILY_TEXT[d.family] : null]
    .filter(Boolean)
    .join(' · ');
  return {
    cover: (
      <>
        {d.cover ? (
          <img src={d.cover} alt="" loading="lazy" />
        ) : (
          <Scene seed={d.id || 1} colors={R.scene} />
        )}
      </>
    ),
    badge: (
      <div className="f-badge" style={o.badgeBg ? { background: o.badgeBg } : undefined}>
        <Px name={d.rarity} color={R.color} scale={10 / 8} />
        <span style={{ color: R.color }}>{R.label.toUpperCase()}</span>
      </div>
    ),
    cost: (
      <div className="f-cost" style={{ borderColor: ring, color: ring }}>
        {d.cost}
      </div>
    ),
    stamp: (
      <div className="f-stamp">
        <Logo size={16} />
      </div>
    ),
    tags: <div className="f-tags">{d.isNew && <span className="f-new">NEW</span>}</div>,
    name: d.name.toUpperCase(),
    meta,
    stats: (
      <div className="f-stats">
        {(['atk', 'def', 'pv', 'vit'] as const).map((k) => (
          <div key={k} className="f-stat" style={o.statCell}>
            <span>{k.toUpperCase()}</span>
            <span style={{ color: o.statVal ?? 'var(--parch)' }}>{d.stats[k]}</span>
          </div>
        ))}
      </div>
    ),
    foot: (
      <div className="f-foot" style={{ color: R.meta }}>
        <span>
          {d.number} · {d.series}
        </span>
        {d.isBound && <Lock text="LIÉE" color={R.meta} />}
        <Wordmark />
      </div>
    ),
  };
}

function Sheen({ R, radius = 12 }: { R: RarityStyle; radius?: number }) {
  if (!R.sh) return null;
  return (
    <div
      className="sheen"
      style={{ borderRadius: radius, ['--sh' as string]: R.sh[0], ['--shd' as string]: R.sh[1] }}
    />
  );
}

type Front = (d: CardData, R: RarityStyle) => ReactNode;

const starter: Front = (d, R) => {
  const p = parts(d, R);
  return (
    <div style={abs({ inset: 0, filter: `${SHADOW} ${DEPTH}` })}>
      <div style={abs({ inset: 0, background: R.color, clipPath: step(6) })} />
      <div className="f-body" style={{ inset: 4, background: 'var(--stone)', clipPath: step(4) }}>
        <div className="f-cover" style={{ clipPath: step(3) }}>
          {p.cover}
          {p.badge}
          {p.cost}
          {p.stamp}
          {p.tags}
        </div>
        <div className="f-name">{p.name}</div>
        <div className="f-meta">{p.meta}</div>
        <div className="f-grow" />
        {p.stats}
        {p.foot}
      </div>
    </div>
  );
};

const bonus: Front = (d, R) => {
  const p = parts(d, R, { statCell: { borderBottom: '2px solid #3FB27F' } });
  const brackets: [CSSProperties, string][] = [
    [{ top: 8, left: 8 }, 'none'],
    [{ top: 8, right: 8 }, 'scaleX(-1)'],
    [{ bottom: 8, left: 8 }, 'scaleY(-1)'],
    [{ bottom: 8, right: 8 }, 'scale(-1,-1)'],
  ];
  return (
    <div style={abs({ inset: 0, filter: `${SHADOW} ${DEPTH}` })}>
      <div
        style={abs({
          inset: 0,
          borderRadius: 12,
          background: 'repeating-linear-gradient(135deg,#3FB27F 0 6px,#36A070 6px 12px)',
        })}
      />
      <div
        className="f-body"
        style={{
          inset: 5,
          borderRadius: 9,
          background: 'linear-gradient(180deg,#1C2A26,var(--stone) 40%)',
          overflow: 'hidden',
        }}
      >
        <div style={abs({ right: -20, bottom: 30, opacity: 0.045 })}>
          <Px name="bonus" color="#3FB27F" scale={18} />
        </div>
        <div className="f-cover" style={{ borderRadius: 5, border: '1px solid #3FB27F' }}>
          {p.cover}
          {p.badge}
          {p.cost}
          {p.stamp}
          {p.tags}
        </div>
        <div className="f-name">{p.name}</div>
        <div className="f-meta" style={{ color: R.meta }}>
          {p.meta}
        </div>
        <div className="f-grow" />
        {p.stats}
        {p.foot}
      </div>
      {brackets.map(([pos, tr], i) => (
        <div key={i} style={abs({ ...pos, transform: tr, zIndex: 5 })}>
          <Px name="bracket" color="#9FE6C4" scale={3} />
        </div>
      ))}
      <Sheen R={R} />
    </div>
  );
};

const combo: Front = (d, R) => {
  const p = parts(d, R, { statCell: { background: '#0E1426', border: '1px solid #2A4C8F' } });
  return (
    <div style={abs({ inset: 0, filter: glow('16px rgba(61,139,255,.45))') })}>
      <div style={abs({ inset: 0, borderRadius: 10, background: '#3D8BFF' })} />
      <div style={abs({ inset: 4, borderRadius: 7, background: 'var(--ink)' })} />
      <div style={abs({ inset: 7, borderRadius: 5, background: '#3D8BFF', opacity: 0.7 })} />
      {(['left', 'right'] as const).flatMap((side) =>
        [90, 220].map((top) => (
          <div
            key={`${side}${top}`}
            style={abs({ [side]: -1, top, width: 5, height: 22, background: 'var(--ink)' })}
          />
        )),
      )}
      <div
        className="f-body"
        style={{
          inset: 9,
          borderRadius: 4,
          padding: 7,
          gap: 6,
          background: 'linear-gradient(180deg,#141C33,var(--stone) 45%)',
        }}
      >
        <div className="f-cover" style={{ height: 138, borderRadius: 3 }}>
          {p.cover}
          <div
            style={abs({
              inset: 0,
              background:
                'repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px)',
            })}
          />
          {p.badge}
          {p.cost}
          {p.stamp}
          {p.tags}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Px name="combo" color="#3D8BFF" scale={1.5} />
          <span className="f-name" style={{ fontSize: 16 }}>
            {p.name}
          </span>
        </div>
        <div className="f-meta" style={{ color: R.meta }}>
          {p.meta}
        </div>
        <div className="f-grow" />
        {p.stats}
        {p.foot}
      </div>
      <Sheen R={R} radius={10} />
    </div>
  );
};

const boss: Front = (d, R) => {
  const p = parts(d, R, {
    statCell: { background: '#0D0816', border: '1px solid #A05CFF' },
    statVal: '#fff',
  });
  return (
    <div style={abs({ inset: 0, filter: glow('22px rgba(160,92,255,.55))') })}>
      <div
        style={abs({
          left: 10,
          right: 10,
          top: -8,
          height: 10,
          background: 'repeating-linear-gradient(90deg,#A05CFF 0 10px,transparent 10px 20px)',
        })}
      />
      <div
        style={abs({
          inset: 0,
          borderRadius: 6,
          background: 'linear-gradient(180deg,#B57BFF,#7A3FD6)',
        })}
      />
      <div
        className="f-body"
        style={{
          inset: 7,
          borderRadius: 3,
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(160,92,255,.28),transparent 70%),#150E20',
        }}
      >
        <div className="f-cover" style={{ border: '2px solid #A05CFF', borderRadius: 2 }}>
          {p.cover}
          <div style={abs({ inset: 0, boxShadow: 'inset 0 0 30px rgba(0,0,0,.7)' })} />
          {p.badge}
          {p.cost}
          {p.stamp}
          {p.tags}
        </div>
        <div
          className="f-name"
          style={{
            fontSize: 18,
            letterSpacing: 2,
            borderBottom: '2px solid #A05CFF',
            paddingBottom: 4,
          }}
        >
          {p.name}
        </div>
        <div className="f-meta" style={{ color: R.meta }}>
          {p.meta}
        </div>
        <div className="f-grow" />
        {p.stats}
        {p.foot}
      </div>
      <div
        style={abs({
          left: '50%',
          top: -16,
          transform: 'translateX(-50%)',
          background: '#150E20',
          border: '2px solid #A05CFF',
          borderRadius: 4,
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 6,
        })}
      >
        <Px name="boss" color="#A05CFF" scale={1.75} />
        <span className="px-label" style={{ fontSize: 9, color: '#E6D4FF' }}>
          BOSS
        </span>
        <Px name="boss" color="#A05CFF" scale={1.75} />
      </div>
      <Sheen R={R} radius={6} />
    </div>
  );
};

const final: Front = (d, R) => {
  const p = parts(d, R, {
    ring: '#FFB13D',
    statCell: { background: '#120805', border: '1px solid #FF8A3D' },
    statVal: '#FFE7CF',
  });
  const flames: [number, number, string][] = [
    [4, 0, '#FF8A3D'],
    [40, 0.3, '#FFB13D'],
    [76, 0.15, '#FF6A2D'],
    [112, 0.45, '#FF8A3D'],
    [148, 0.2, '#FFB13D'],
    [184, 0.35, '#FF6A2D'],
    [214, 0.1, '#FF8A3D'],
  ];
  const embers: [number, number][] = [
    [30, 0],
    [90, 0.8],
    [150, 0.4],
    [200, 1.2],
    [120, 1.6],
  ];
  return (
    <div style={abs({ inset: 0, filter: glow('26px rgba(255,138,61,.6))') })}>
      <div
        style={abs({
          inset: 0,
          borderRadius: 10,
          background: 'linear-gradient(180deg,#FFC46B,#FF8A3D 40%,#C2410C)',
        })}
      />
      <div
        className="f-body"
        style={{
          inset: 6,
          borderRadius: 6,
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse 90% 40% at 50% 100%,rgba(255,138,61,.35),transparent 70%),#1A0F0A',
        }}
      >
        <div className="f-cover" style={{ borderRadius: 3, border: '2px solid #FFB13D' }}>
          {p.cover}
          {p.badge}
          {p.cost}
          {p.stamp}
          {p.tags}
        </div>
        <div
          style={{
            alignSelf: 'center',
            background: '#FF8A3D',
            color: '#1A0F0A',
            padding: '3px 14px',
            fontFamily: 'Cinzel, serif',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: 2,
            maxWidth: '100%',
            textAlign: 'center',
            clipPath:
              'polygon(6px 0,calc(100% - 6px) 0,100% 50%,calc(100% - 6px) 100%,6px 100%,0 50%)',
          }}
        >
          {p.name}
        </div>
        <div className="f-meta" style={{ color: R.meta, textAlign: 'center' }}>
          {p.meta}
        </div>
        <div className="f-grow" />
        {p.stats}
        {p.foot}
        {embers.map(([x, delay]) => (
          <div key={x} className="ember" style={{ left: x, animationDelay: `${delay}s` }} />
        ))}
      </div>
      {flames.map(([x, delay, c]) => (
        <div key={x} className="flame" style={{ left: x, animationDelay: `${delay}s` }}>
          <Px name="flame" color={c} scale={3} />
        </div>
      ))}
      <div
        style={abs({
          left: '50%',
          top: -20,
          transform: 'translateX(-50%)',
          zIndex: 6,
          filter: 'drop-shadow(0 0 8px rgba(255,177,61,.8))',
        })}
      >
        <Px name="final" color="#FFC46B" scale={4.25} />
      </div>
      <Sheen R={R} radius={10} />
    </div>
  );
};

const hof: Front = (d, R) => {
  const p = parts(d, R, {
    ring: '#FFD23F',
    statCell: { background: 'rgba(18,14,26,.7)', border: '1px solid rgba(255,210,63,.5)' },
    statVal: '#fff',
  });
  const sparks: [number, number, number][] = [
    [30, 60, 0],
    [180, 40, 0.7],
    [200, 120, 1.3],
    [50, 150, 1.9],
    [120, 30, 0.4],
  ];
  return (
    <div style={abs({ inset: 0, filter: glow('30px rgba(79,227,209,.55))') })}>
      <div
        className="holo"
        style={abs({ inset: 0, borderRadius: 14, background: 'var(--holo)' })}
      />
      <div style={abs({ inset: 5, borderRadius: 10, overflow: 'hidden' })}>
        <div style={abs({ inset: 0 })}>{p.cover}</div>
        <div className="foil" />
        {sparks.map(([x, y, delay]) => (
          <div key={x} className="spark" style={{ left: x, top: y, animationDelay: `${delay}s` }}>
            <Px name="spark" color="#fff" scale={2} />
          </div>
        ))}
        <div
          style={abs({
            left: 0,
            right: 0,
            top: 8,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 4,
          })}
        >
          <div
            style={{
              background: 'rgba(18,14,26,.85)',
              border: '1px solid #FFD23F',
              borderRadius: 4,
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Px name="hof" color="#FFD23F" scale={1.5} />
            <span className="px-label" style={{ fontSize: 9, color: '#FFD23F' }}>
              HALL OF FAME
            </span>
            <Px name="hof" color="#FFD23F" scale={1.5} />
          </div>
        </div>
        {p.cost}
        <div style={abs({ left: 6, top: 150, zIndex: 4 })}>{p.tags}</div>
        <div style={abs({ right: 8, top: 150, zIndex: 4 })}>
          <Logo size={18} />
        </div>
        <div
          style={abs({
            left: 0,
            right: 0,
            bottom: 0,
            padding: '60px 10px 8px',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            background: 'linear-gradient(180deg,rgba(18,14,26,0),rgba(18,14,26,.92) 45%)',
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Px name="laurel" color="#FFD23F" scale={2} />
            <span className="f-name" style={{ textAlign: 'center' }}>
              {p.name}
            </span>
            <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>
              <Px name="laurel" color="#FFD23F" scale={2} />
            </span>
          </div>
          <div className="f-meta" style={{ color: R.meta, textAlign: 'center' }}>
            {p.meta}
          </div>
          {p.stats}
          {p.foot}
        </div>
      </div>
      <Sheen R={R} radius={14} />
    </div>
  );
};

const FRONTS = { starter, bonus, combo, boss, final, hof };

/**
 * Variante VIP (maquette pixpedia-cartes-animations.html) : cadre or animé, « VARIANTE VIP »,
 * rareté rappelée dans la méta, cadenas « LIÉE » (cartes du pack abonné, règle JONUM). Mêmes stats.
 */
function vip(d: CardData, R: RarityStyle) {
  return (
    <div style={abs({ inset: 0, filter: glow('22px rgba(232,192,96,.45))') })}>
      <div
        className="c-gold"
        style={abs({
          inset: 0,
          borderRadius: 12,
          background: 'linear-gradient(135deg,#FFE7A0,#D9A93B 35%,#FFF1C2 50%,#B8862A 70%,#FFE7A0)',
          backgroundSize: '200% 200%',
        })}
      />
      <div
        className="f-body"
        style={{ inset: 5, borderRadius: 8, background: 'linear-gradient(180deg,#221A0B,#140F07)' }}
      >
        <div
          className="f-cover"
          style={{ height: 146, borderRadius: 4, border: '1px solid #E8C060' }}
        >
          {d.cover ? (
            <img src={d.cover} alt="" loading="lazy" />
          ) : (
            <Scene seed={d.id || 1} colors={['#6B5520', '#241B08', '#140F05', '#FFD86B']} />
          )}
          <div
            style={abs({
              inset: 0,
              background:
                'linear-gradient(115deg,rgba(255,231,160,0) 30%,rgba(255,231,160,.35) 50%,rgba(255,231,160,0) 70%)',
              mixBlendMode: 'screen',
            })}
          />
          <div className="f-badge" style={{ background: '#140F07', border: '1px solid #E8C060' }}>
            <Px name="crown" color="#FFD86B" scale={2} />
            <span style={{ color: '#FFD86B', fontSize: 8 }}>VARIANTE VIP</span>
          </div>
          <div
            className="f-cost"
            style={{ borderColor: '#E8C060', color: '#FFD86B', background: '#140F07' }}
          >
            {d.cost}
          </div>
          <div className="f-stamp" style={{ opacity: 1, filter: 'none' }}>
            <Logo size={16} />
          </div>
          <div className="f-tags">{d.isNew && <span className="f-new">NEW</span>}</div>
        </div>
        <div className="f-name" style={{ color: '#FFF1C2', textAlign: 'center' }}>
          {d.name.toUpperCase()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="f-meta" style={{ color: '#D9B66A' }}>
            {[d.year, d.platform?.toUpperCase(), R.label.toUpperCase()].filter(Boolean).join(' · ')}
          </span>
          <span
            className="px-label"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: '#140F07',
              border: '1px solid #E8C060',
              borderRadius: 3,
              padding: '2px 6px',
              fontSize: 7,
              color: '#E8C060',
              letterSpacing: 0,
            }}
          >
            <Px name="lock" color="#E8C060" scale={2} />
            LIÉE
          </span>
        </div>
        <div className="f-grow" />
        <div className="f-stats">
          {(['atk', 'def', 'pv', 'vit'] as const).map((k) => (
            <div
              key={k}
              className="f-stat"
              style={{ background: '#0B0906', border: '1px solid #6B5520' }}
            >
              <span style={{ color: '#D9B66A' }}>{k.toUpperCase()}</span>
              <span style={{ color: '#FFF1C2' }}>{d.stats[k]}</span>
            </div>
          ))}
        </div>
        <div className="f-foot" style={{ color: '#D9B66A' }}>
          <span>
            {d.number} · {d.series}
          </span>
          <Wordmark />
        </div>
      </div>
      <div
        className="c-sheen"
        style={{
          ...abs({ inset: 0, borderRadius: 12, overflow: 'hidden', pointerEvents: 'none' }),
          ['--sh' as string]: 'rgba(255,240,200,.35)',
          ['--shd' as string]: '4s',
        }}
      />
    </div>
  );
}

/** Carte d'événement (équipe esport), toujours liée au compte. */
function eventFront(d: CardData) {
  const e = d.event!;
  return (
    <div style={abs({ inset: 0, filter: `${SHADOW} ${DEPTH}` })}>
      <div
        style={abs({
          inset: 0,
          borderRadius: 10,
          background: 'repeating-linear-gradient(45deg,#FF8A3D 0 8px,#E56F22 8px 16px)',
        })}
      />
      <div className="f-body" style={{ inset: 5, borderRadius: 7, background: '#1A120F' }}>
        <div className="f-event-head">
          <Px name="trophy" color="#1A120F" scale={2} />
          <span style={{ fontSize: 9 }}>{e.name.toUpperCase()}</span>
          <span>
            {e.region} · SEED {e.seed}
          </span>
        </div>
        <div
          className="f-cover"
          style={{
            height: 120,
            borderRadius: 4,
            background: 'radial-gradient(circle at 50% 55%,#3A2318,#1A120F 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {d.cover ? (
            <img src={d.cover} alt="" />
          ) : (
            <>
              <div className="f-event-grid" />
              <div style={{ position: 'relative' }}>
                <Px name="shield" color="#FF8A3D" scale={12} />
              </div>
            </>
          )}
          <div className="f-stamp">
            <Logo size={16} col="#EADFC8" acc="#FF8A3D" />
          </div>
        </div>
        <div className="f-name" style={{ fontSize: 18, letterSpacing: 2, textAlign: 'center' }}>
          {d.name.toUpperCase()}
        </div>
        <div className="f-meta" style={{ color: '#FFC48F', textAlign: 'center', fontSize: 7 }}>
          PARCOURS DANS LE TOURNOI · MIS À JOUR EN DIRECT
        </div>
        <div style={{ display: 'flex', gap: 2, padding: '0 4px' }}>
          {e.steps.map((s) => (
            <div key={s.label} className="f-step">
              <div
                style={{
                  width: 10,
                  height: 10,
                  border: '1px solid #FF8A3D',
                  background: s.done ? '#FF8A3D' : '#2E2639',
                }}
              />
              <span style={{ color: s.done ? '#FFC48F' : '#6B6178' }}>{s.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
        <div className="f-grow" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Lock text="CARTE LIÉE" color="#FFB13D" />
          <span className="px-label" style={{ fontSize: 7, color: '#FFC48F' }}>
            ÉQUIPE {String(e.index).padStart(2, '0')} / {e.total}
          </span>
        </div>
        <div className="f-foot" style={{ color: '#FFC48F' }}>
          <span>
            {d.number} · {d.series}
          </span>
          <Wordmark />
        </div>
      </div>
      <div
        className="sheen"
        style={{
          borderRadius: 10,
          ['--sh' as string]: 'rgba(255,220,160,.22)',
          ['--shd' as string]: '5s',
        }}
      />
    </div>
  );
}

export function CardFront({ data }: { data: CardData }) {
  const R = RARITY_STYLE[data.rarity];
  if (data.event) return eventFront(data);
  // Éditions : Full art et Arène ont leur propre recto ; Holo s'ajoute sur la carte de sa rareté.
  if (data.finish === 'arena') return <ArenaFront d={data} />;
  if (data.finish === 'fullart') return <FullArtFront d={data} />;
  const base = data.variant === 'vip' ? vip(data, R) : FRONTS[data.rarity](data, R);
  if (data.finish === 'holo') {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        {base}
        <HoloOverlay />
      </div>
    );
  }
  return base;
}

/**
 * Dos d'une carte. Sans `special` (ouverture de packs), toujours le dos standard : rien ne
 * trahit la rareté ni la finition avant la révélation. Avec `special` : priorité de getCardBack.
 */
export function CardBack({
  data,
  special = false,
}: {
  data?: Pick<CardData, 'rarity' | 'finish' | 'variant' | 'event' | 'eventName'>;
  special?: boolean;
}) {
  const kind =
    data && special
      ? getCardBack({
          rarity: data.rarity,
          finish: data.finish ?? 'normal',
          variant: data.event ? 'event' : data.variant,
        })
      : 'standard';
  return (
    <div style={{ position: 'absolute', inset: 0 }} data-back={kind}>
      <CardBackOf kind={kind} eventName={data?.eventName ?? undefined} />
    </div>
  );
}
