import type { CSSProperties } from 'react';
import { Logo } from '../../card/pixel';
import { PackArt } from './PackStack';
import type { TearDriver } from './types';

/** Haut du pack déchiré en zigzag (14 dents entre 12,8 % et 17,2 % de la hauteur). */
const ZIGZAG = Array.from(
  { length: 15 },
  (_, i) => `${((i * 100) / 14).toFixed(2)}% ${i % 2 ? 17.2 : 12.8}%`,
);
const BODY_CLIP = `polygon(${ZIGZAG.join(', ')}, 100% 100%, 0% 100%)`;
const FLAP_CLIP = `polygon(0% 0%, 100% 0%, ${[...ZIGZAG].reverse().join(', ')})`;

/** Délais d'un pack (en secondes), relevés dans la maquette. */
function timings(k: number, fast: boolean) {
  if (!fast)
    return { tear: 0, shadow: 0.3, flap: 0.32, drop: 0.55, bursts: [0.38, 0.44, 0.5], deck: 0.75 };
  const d = k * 0.38;
  return {
    tear: d,
    shadow: d + 0.17,
    flap: d + 0.18,
    drop: d + 0.3,
    bursts: [d + 0.38, d + 0.44, d + 0.5],
    deck: d + 0.41,
  };
}

const s = (v: number) => `${v.toFixed(2)}s`;
const vars = (v: Record<string, string>) => v as CSSProperties;

function MiniBack({ style, className }: { style: CSSProperties; className: string }) {
  return (
    <div className={`op-mini-back ${className}`} style={style}>
      <Logo size={30} />
    </div>
  );
}

/**
 * Déchirure automatique des packs : ligne lumineuse, rabat qui s'envole, dos de cartes qui
 * jaillissent, pack qui tombe. À plusieurs packs, ils se déchirent l'un après l'autre (0,38 s).
 */
export function TearAnimation({
  count,
  label,
  driver = { kind: 'auto' },
}: {
  count: number;
  label: string;
  driver?: TearDriver;
}) {
  // V2 : un pilote « gesture » réglera ces animations sur la progression du doigt.
  void driver;
  const fast = count > 1;
  return (
    <div className={fast ? 'op-fast' : undefined}>
      {Array.from({ length: count }, (_, i) => count - 1 - i).map((k) => {
        const t = timings(k, fast);
        return (
          <div key={k}>
            <div
              className="op-pack op-adv"
              style={{
                zIndex: 20 - k,
                animationDuration: k === 0 ? '0.01s' : s(k * 0.38),
                filter: `brightness(${(1 - 0.08 * k).toFixed(2)})`,
                ...vars({ '--k': String(k) }),
              }}
            >
              <div
                className="op-drop"
                style={{ position: 'absolute', inset: 0, animationDelay: s(t.drop) }}
              >
                <div
                  className="op-shadow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 12,
                    boxShadow: '0 18px 30px rgba(0,0,0,0.55)',
                    animationDelay: s(t.shadow),
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, clipPath: BODY_CLIP }}>
                  <PackArt label={label} />
                </div>
                <div
                  className="op-flap"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    clipPath: FLAP_CLIP,
                    animationDelay: s(t.flap),
                  }}
                >
                  <PackArt label={label} />
                </div>
                <div
                  className="op-tear"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '15%',
                    height: 3,
                    marginTop: -1,
                    background: '#FFFFFF',
                    boxShadow: '0 0 12px #4FE3D1, 0 0 24px #4FE3D1',
                    transformOrigin: 'left center',
                    animationDelay: `${s(t.tear)}, ${s(t.flap)}`,
                  }}
                />
              </div>
            </div>
            {[-40, 0, 40].map((bx, j) => (
              <MiniBack
                key={bx}
                className="op-burst"
                style={{
                  left: 145 + j * 14,
                  top: 170,
                  zIndex: 30,
                  animationDelay: s(t.bursts[j]!),
                  ...vars({ '--bx': `${bx}px`, '--by': '430px' }),
                }}
              />
            ))}
            <MiniBack
              className="op-deck"
              style={{
                left: fast ? 159 + 2 * k : 159,
                top: fast ? 600 - 2 * k : 600,
                zIndex: 25 + k,
                animationDelay: s(t.deck),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
