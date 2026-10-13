import type { CSSProperties } from 'react';
import { Card } from '../../../card/Card';
import { DropBack, type SceneProps } from '../drops/shared';

/** Poussière dorée : [x, y, largeur, hauteur, délai, durée] (maquette, iframe Full art). */
const DUST: [number, number, number, number, number, number][] = [
  [144, 414, 4, 3, 3.06, 2.93],
  [303, 462, 3, 3, 3.68, 2.53],
  [279, 235, 3, 3, 3.94, 3.89],
  [283, 408, 4, 2, 4.01, 3.58],
  [119, 532, 3, 2, 2.41, 4.14],
  [123, 210, 4, 3, 3.2, 3.19],
  [308, 277, 3, 2, 3.04, 4.14],
  [98, 301, 3, 2, 2.34, 3.45],
  [258, 302, 3, 3, 3.88, 3.32],
  [246, 431, 4, 3, 4.09, 3.27],
  [73, 247, 3, 4, 2.11, 2.64],
  [327, 313, 3, 2, 2.46, 2.84],
  [238, 370, 3, 3, 2.59, 2.84],
  [149, 419, 3, 3, 3.47, 3.85],
  [183, 408, 3, 2, 3.87, 3.48],
  [252, 541, 3, 3, 2.42, 2.64],
  [268, 447, 2, 3, 2.2, 3.02],
  [208, 217, 4, 3, 2.44, 2.64],
];

const GOLD = '#F5E3B0';
const vars = (v: Record<string, string>) => v as CSSProperties;

/**
 * Finition Full art, ~3 s : bandes « cinéma », illustration en 8 bandes qui glissent en
 * alternance, travelling, projecteur et poussière, reflet de vernis, cadre doré et cartel.
 */
export function FullArtFinish({ card }: SceneProps) {
  return (
    <div className="dp-fill">
      <div
        className="dp-fill"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 45%,#1C1730,#060409 75%)' }}
      />
      <div className="dp-core">
        <div
          className="fa-cone dp-abs dp-loop"
          style={{
            left: 45,
            top: -40,
            width: 300,
            height: 640,
            background:
              'linear-gradient(180deg,rgba(255,240,210,.28),rgba(255,240,210,.06) 70%,transparent)',
            clipPath: 'polygon(42% 0,58% 0,100% 100%,0 100%)',
          }}
        />
        <div className="dp-cardbox">
          <div className="fa-back dp-fill">
            <DropBack />
          </div>
          <div className="dp-fill" style={{ borderRadius: 12, overflow: 'hidden' }}>
            <div className="fa-kb dp-fill">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="fa-strip dp-fill"
                  style={{
                    clipPath: `inset(0 ${210 - i * 30}px 0 ${i * 30}px)`,
                    ...vars({
                      '--from': i % 2 ? '-360px' : '360px',
                      '--d': `${(0.55 + i * 0.05).toFixed(2)}s`,
                    }),
                  }}
                >
                  <Card data={card} width={240} tilt={false} onActivate={() => {}} />
                </div>
              ))}
            </div>
          </div>
          <div
            className="fa-sweep dp-fill"
            style={{ borderRadius: 12, overflow: 'hidden', pointerEvents: 'none' }}
          >
            <div
              className="dp-abs"
              style={{
                top: '-20%',
                bottom: '-20%',
                left: '-70%',
                width: '40%',
                background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent)',
              }}
            />
          </div>
          <div
            className="fa-l fa-t dp-abs"
            style={{
              left: -10,
              right: -10,
              top: -10,
              height: 2,
              background: GOLD,
              transformOrigin: 'left',
            }}
          />
          <div
            className="fa-l fa-r dp-abs"
            style={{
              top: -10,
              bottom: -10,
              right: -10,
              width: 2,
              background: GOLD,
              transformOrigin: 'top',
            }}
          />
          <div
            className="fa-l fa-b dp-abs"
            style={{
              left: -10,
              right: -10,
              bottom: -10,
              height: 2,
              background: GOLD,
              transformOrigin: 'right',
            }}
          />
          <div
            className="fa-l fa-lft dp-abs"
            style={{
              top: -10,
              bottom: -10,
              left: -10,
              width: 2,
              background: GOLD,
              transformOrigin: 'bottom',
            }}
          />
        </div>
        {DUST.map(([left, top, width, height, delay, duration], i) => (
          <div
            key={i}
            className="fa-dust dp-abs dp-loop"
            style={{
              left,
              top,
              width,
              height,
              background: GOLD,
              animationDelay: `calc(${delay}s - var(--after, 0s))`,
              animationDuration: `${duration}s`,
            }}
          />
        ))}
        <div className="dp-label" style={{ top: 582, gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="fa-line"
              style={{ width: 60, height: 1, background: GOLD, transformOrigin: 'right' }}
            />
            <div
              className="fa-title"
              style={{
                fontFamily: 'Cinzel, serif',
                fontWeight: 700,
                fontSize: 24,
                color: GOLD,
                whiteSpace: 'nowrap',
              }}
            >
              FULL ART
            </div>
            <div
              className="fa-line"
              style={{ width: 60, height: 1, background: GOLD, transformOrigin: 'left' }}
            />
          </div>
          <div
            className="fa-plaque dp-px"
            style={{ fontSize: 9, color: '#C9BFA6', letterSpacing: 1 }}
          >
            {[card.name.toUpperCase(), card.year, "L'ILLUSTRATION EN GRAND"]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
      </div>
      {/* Bandes noires en pleine largeur, calées sur le haut et le bas de la scène. */}
      <div className="fa-bar fa-bar-t" />
      <div className="fa-bar fa-bar-b" />
    </div>
  );
}
