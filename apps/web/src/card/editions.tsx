import type { CSSProperties, ReactNode } from 'react';
import { Logo, Px, Scene, Wordmark } from './pixel';
import { FAMILY_TEXT, RARITY_STYLE, type CardData } from './types';

/*
 * Éditions de la maquette pixpedia-cartes-animations.html : Holo (couche sur la carte de sa
 * rareté), Full art et Édition Arène (rectos complets). Styles repris tels quels ; seuls les
 * champs de la carte (nom, méta, stats, jaquette, numéro, événement, date) sont dynamiques.
 */

const HOLO_GRADIENT = 'conic-gradient(from 200deg,#2EE6FF,#A05CFF,#FF4FB0,#FFD23F,#2EE6FF)';
const vars = (v: Record<string, string>) => v as CSSProperties;
const meta = (d: CardData) =>
  [d.year, d.platform?.toUpperCase(), d.family ? FAMILY_TEXT[d.family] : null]
    .filter(Boolean)
    .join(' · ');

function Illustration({ d }: { d: CardData }) {
  return d.cover ? (
    <img
      src={d.cover}
      alt=""
      loading="lazy"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
    />
  ) : (
    <Scene seed={d.id || 1} colors={RARITY_STYLE[d.rarity].scene} />
  );
}

function Spark({ left, top, delay }: { left: number; top: number; delay: number }) {
  return (
    <div
      className="c-spark"
      style={{ position: 'absolute', left, top, zIndex: 8, animationDelay: `${delay}s` }}
    >
      <Px name="spark" color="#fff" scale={2} />
    </div>
  );
}

/** Couche Holo : feuille arc-en-ciel animée, stries diagonales, lueur, 4 étincelles, étiquette « HOLO ». */
export function HoloOverlay() {
  return (
    <>
      <div
        data-finish="holo"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 7,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          className="c-foil"
          style={{
            position: 'absolute',
            inset: 0,
            mixBlendMode: 'color-dodge',
            opacity: 0.55,
            background:
              'linear-gradient(115deg,rgba(46,230,255,0) 15%,rgba(46,230,255,.55) 30%,rgba(160,92,255,.5) 42%,rgba(255,79,176,.55) 54%,rgba(255,210,63,.55) 66%,rgba(255,210,63,0) 80%)',
            backgroundSize: '260% 260%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            mixBlendMode: 'overlay',
            opacity: 0.35,
            background:
              'repeating-linear-gradient(135deg,rgba(255,255,255,.0) 0 6px,rgba(255,255,255,.35) 6px 7px)',
          }}
        />
        <div
          className="c-holo"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 12,
            boxShadow: 'inset 0 0 0 3px rgba(255,255,255,.0),inset 0 0 18px rgba(160,92,255,.35)',
          }}
        />
      </div>
      <Spark left={26} top={40} delay={0} />
      <Spark left={196} top={90} delay={0.8} />
      <Spark left={60} top={200} delay={1.5} />
      <Spark left={190} top={250} delay={2.1} />
      <div
        style={{
          position: 'absolute',
          right: 8,
          bottom: 56,
          zIndex: 9,
          background: 'rgba(18,14,26,.85)',
          color: '#FFFFFF',
          border: '1px solid #A05CFF',
          borderRadius: 3,
          padding: '2px 6px',
          fontFamily: 'Silkscreen, monospace',
          fontSize: 8,
          letterSpacing: 1,
        }}
      >
        HOLO
      </div>
    </>
  );
}

function Stats({
  d,
  cell,
  label,
  value,
}: {
  d: CardData;
  cell: CSSProperties;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
      {(['atk', 'def', 'pv', 'vit'] as const).map((k) => (
        <div
          key={k}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...cell }}
        >
          <span style={{ fontFamily: 'Silkscreen, monospace', fontSize: 7, color: label }}>
            {k.toUpperCase()}
          </span>
          <span style={{ fontFamily: 'Silkscreen, monospace', fontSize: 12, color: value }}>
            {d.stats[k]}
          </span>
        </div>
      ))}
    </div>
  );
}

const WM = <Wordmark />;

/** Full art : illustration pleine carte avec vignettage, cadre de 3 px à la couleur de la rareté (holo pour Hall of Fame). */
export function FullArtFront({ d }: { d: CardData }): ReactNode {
  const R = RARITY_STYLE[d.rarity];
  const hof = d.rarity === 'hof';
  return (
    <div
      data-finish="fullart"
      style={{
        position: 'relative',
        width: 240,
        height: 336,
        filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,.5)) drop-shadow(0 20px 26px rgba(0,0,0,.5))',
      }}
    >
      <div
        className={hof ? 'c-holo' : ''}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          background: hof ? HOLO_GRADIENT : R.color,
        }}
      />
      <div style={{ position: 'absolute', inset: 3, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, transform: 'scale(1.02)' }}>
          <Illustration d={d} />
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 120% 70% at 50% 30%,transparent 50%,rgba(0,0,0,.45))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(18,14,26,.6)',
            backdropFilter: 'blur(2px)',
            borderRadius: 4,
            padding: '3px 6px',
          }}
        >
          <Px name={d.rarity} color={R.color} scale={10 / 8} />
          <span style={{ fontFamily: 'Silkscreen, monospace', fontSize: 9, color: R.color }}>
            {R.label.toUpperCase()}
          </span>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            zIndex: 3,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(18,14,26,.6)',
            border: '2px solid #fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Silkscreen, monospace',
            fontSize: 12,
            color: '#fff',
            boxSizing: 'border-box',
          }}
        >
          {d.cost}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: '50px 10px 8px',
            background: 'linear-gradient(180deg,transparent,rgba(10,8,16,.88) 42%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
          }}
        >
          <div
            style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 700,
              fontSize: 19,
              letterSpacing: 1,
              color: '#fff',
              textShadow: '2px 2px 0 rgba(0,0,0,.6)',
              textAlign: 'center',
            }}
          >
            {d.name.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: 'Silkscreen, monospace',
              fontSize: 8,
              color: '#D8D0E4',
              textAlign: 'center',
            }}
          >
            {meta(d)}
          </div>
          <Stats
            d={d}
            cell={{ padding: '3px 0', background: 'rgba(18,14,26,.55)', borderRadius: 3 }}
            label="#D8D0E4"
            value="#fff"
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'Silkscreen, monospace',
              fontSize: 7,
              color: '#D8D0E4',
            }}
          >
            <span>
              {d.number} · {d.series} · FULL ART
            </span>
            {WM}
          </div>
        </div>
        <div style={{ position: 'absolute', right: 8, top: 44, opacity: 0.9 }}>
          <Logo size={16} />
        </div>
      </div>
      <div
        className="c-sheen"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          overflow: 'hidden',
          pointerEvents: 'none',
          ...vars({ '--sh': 'rgba(255,255,255,.22)', '--shd': '4.5s' }),
        }}
      />
    </div>
  );
}

/** Édition Arène : cadre néon qui pulse, en-tête avec LED, projecteurs, public pixel, liée au compte. */
export function ArenaFront({ d }: { d: CardData }): ReactNode {
  const R = RARITY_STYLE[d.rarity];
  const obtained = d.obtainedAt
    ? new Date(d.obtainedAt).toLocaleDateString('fr-FR').replace(/\//g, '.')
    : '';
  return (
    <div
      data-finish="arena"
      style={{
        position: 'relative',
        width: 240,
        height: 336,
        filter:
          'drop-shadow(3px 3px 0 rgba(0,0,0,.5)) drop-shadow(0 0 18px rgba(255,79,176,.45)) drop-shadow(0 20px 26px rgba(0,0,0,.5))',
      }}
    >
      <div
        className="ar-neon"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 10,
          background: 'linear-gradient(135deg,#FF4FB0,#A05CFF 50%,#2EE6FF)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 4,
          borderRadius: 7,
          background: '#0B0714',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '0 8px 8px',
        }}
      >
        <div
          style={{
            margin: '0 -8px',
            padding: '5px 8px',
            background: '#120A20',
            borderBottom: '1px solid #3A1F5A',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'Silkscreen, monospace',
              fontSize: 8,
            }}
          >
            <span style={{ color: '#FF4FB0' }}>ÉDITION ARÈNE</span>
            <span style={{ color: '#2EE6FF' }}>{(d.eventName ?? 'ÉVÉNEMENT').toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {Array.from({ length: 14 }, (_, i) => (
              <div
                key={i}
                className="ar-led"
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: i % 2 ? '#2EE6FF' : '#FF4FB0',
                  animationDelay: `${(i / 10).toFixed(1)}s`,
                }}
              />
            ))}
          </div>
        </div>
        <div
          style={{
            height: 132,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            border: '1px solid #3A1F5A',
            flexShrink: 0,
          }}
        >
          <Illustration d={d} />
          <div
            className="ar-beam"
            style={{
              position: 'absolute',
              left: 30,
              top: -20,
              width: 40,
              height: 190,
              background: 'linear-gradient(180deg,rgba(46,230,255,.45),transparent)',
              transformOrigin: 'top center',
              transform: 'rotate(18deg)',
            }}
          />
          <div
            className="ar-beam2"
            style={{
              position: 'absolute',
              right: 30,
              top: -20,
              width: 40,
              height: 190,
              background: 'linear-gradient(180deg,rgba(255,79,176,.45),transparent)',
              transformOrigin: 'top center',
              transform: 'rotate(-18deg)',
            }}
          />
          <svg
            viewBox="0 0 60 26"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              left: '0',
              right: '0',
              bottom: '0',
              width: '100%',
              height: '34px',
            }}
            shapeRendering="crispEdges"
          >
            <g fill="#06040C">
              <rect x="0" y="21" width="2" height="5" />
              <rect x="2" y="20" width="2" height="6" />
              <rect x="4" y="22" width="2" height="4" />
              <rect x="6" y="22" width="2" height="4" />
              <rect x="8" y="22" width="2" height="4" />
              <rect x="10" y="22" width="2" height="4" />
              <rect x="12" y="23" width="2" height="3" />
              <rect x="14" y="22" width="2" height="4" />
              <rect x="16" y="20" width="2" height="6" />
              <rect x="18" y="21" width="2" height="5" />
              <rect x="20" y="20" width="2" height="6" />
              <rect x="22" y="23" width="2" height="3" />
              <rect x="24" y="22" width="2" height="4" />
              <rect x="26" y="20" width="2" height="6" />
              <rect x="28" y="20" width="2" height="6" />
              <rect x="30" y="23" width="2" height="3" />
              <rect x="32" y="21" width="2" height="5" />
              <rect x="34" y="22" width="2" height="4" />
              <rect x="36" y="21" width="2" height="5" />
              <rect x="38" y="21" width="2" height="5" />
              <rect x="40" y="22" width="2" height="4" />
              <rect x="42" y="22" width="2" height="4" />
              <rect x="44" y="22" width="2" height="4" />
              <rect x="46" y="23" width="2" height="3" />
              <rect x="48" y="23" width="2" height="3" />
              <rect x="50" y="22" width="2" height="4" />
              <rect x="52" y="20" width="2" height="6" />
              <rect x="54" y="20" width="2" height="6" />
              <rect x="56" y="23" width="2" height="3" />
              <rect x="58" y="21" width="2" height="5" />
            </g>
          </svg>
          <div
            style={{
              position: 'absolute',
              top: 6,
              left: 6,
              background: '#0B0714',
              borderRadius: 4,
              padding: '3px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Px name={d.rarity} color={R.color} scale={10 / 8} />
            <span style={{ fontFamily: 'Silkscreen, monospace', fontSize: 9, color: R.color }}>
              {R.label.toUpperCase()}
            </span>
          </div>
          <div
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#0B0714',
              border: '2px solid #2EE6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Silkscreen, monospace',
              fontSize: 12,
              color: '#2EE6FF',
              boxSizing: 'border-box',
            }}
          >
            {d.cost}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Cinzel, serif',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 1,
            color: '#fff',
            textShadow: '0 0 10px rgba(255,79,176,.6)',
            textAlign: 'center',
          }}
        >
          {d.name.toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: 'Silkscreen, monospace',
            fontSize: 8,
            color: '#C9A8FF',
            textAlign: 'center',
          }}
        >
          {meta(d)}
        </div>
        <div style={{ flexGrow: 1 }} />
        <Stats
          d={d}
          cell={{
            padding: '4px 0',
            background: '#0A0714',
            border: '1px solid #3A1F5A',
            borderRadius: 3,
          }}
          label="#C9A8FF"
          value="#fff"
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Silkscreen, monospace',
            fontSize: 7,
            color: '#C9A8FF',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              border: '1px solid #FF4FB0',
              color: '#FF4FB0',
              borderRadius: 3,
              padding: '1px 5px',
            }}
          >
            <Px name="lock" color="#FF4FB0" scale={2} />
            LIÉE AU COMPTE
          </span>
          <span>{obtained}</span>
          {WM}
        </div>
      </div>
      <div
        className="c-sheen"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 10,
          overflow: 'hidden',
          pointerEvents: 'none',
          ...vars({ '--sh': 'rgba(255,180,230,.25)', '--shd': '4s' }),
        }}
      />
    </div>
  );
}
