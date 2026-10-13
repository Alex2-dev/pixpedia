import type { CSSProperties } from 'react';
import { DropBack, DropFront, type SceneProps } from '../drops/shared';

/** Gerbe d'étincelles : 16 carrés qui partent du centre de la carte (maquette, iframe Holo). */
const SPARKS: [string, number, number][] = [
  ['#A05CFF', 170, 0],
  ['#FF4FB0', 157, 84],
  ['#2EE6FF', 120, 155],
  ['#FFD23F', 65, 203],
  ['#FFD23F', 0, 219],
  ['#A05CFF', -65, 203],
  ['#2EE6FF', -120, 155],
  ['#2EE6FF', -157, 84],
  ['#2EE6FF', -169, 0],
  ['#FFD23F', -157, -84],
  ['#fff', -120, -155],
  ['#FF4FB0', -65, -203],
  ['#2EE6FF', 0, -219],
  ['#A05CFF', 65, -203],
  ['#fff', 120, -155],
  ['#fff', 157, -84],
];

/** Finition Holo, ~1,7 s : retournement, vague arc-en-ciel, étincelles, tampon « HOLO ». */
export function HoloFinish({ card }: SceneProps) {
  return (
    <div className="dp-fill">
      <div
        className="dp-fill"
        style={{ background: 'radial-gradient(circle at 50% 45%,#221A3A,#0B0812 70%)' }}
      />
      <div className="dp-core">
        {SPARKS.map(([bg, dx, dy], i) => (
          <div
            key={i}
            className="hl-sp dp-abs"
            style={
              {
                left: 193,
                top: 378,
                width: 6,
                height: 6,
                background: bg,
                '--dx': `${dx}px`,
                '--dy': `${dy}px`,
              } as CSSProperties
            }
          />
        ))}
        <div className="dp-cardbox">
          <div className="hl-back dp-fill">
            <DropBack />
          </div>
          <div className="hl-front dp-fill">
            <DropFront card={card} />
          </div>
          <div
            className="dp-fill"
            style={{ borderRadius: 12, overflow: 'hidden', pointerEvents: 'none', zIndex: 20 }}
          >
            <div
              className="hl-wave dp-abs"
              style={{
                top: '-30%',
                bottom: '-30%',
                left: '-120%',
                width: '110%',
                background:
                  'linear-gradient(100deg,transparent,rgba(46,230,255,.55),rgba(160,92,255,.55),rgba(255,79,176,.55),rgba(255,210,63,.55),transparent)',
                mixBlendMode: 'screen',
              }}
            />
          </div>
          <div
            className="hl-stamp dp-abs"
            style={{
              left: '50%',
              top: -22,
              marginLeft: -44,
              width: 88,
              height: 28,
              borderRadius: 4,
              background: 'conic-gradient(from 200deg,#2EE6FF,#A05CFF,#FF4FB0,#FFD23F,#2EE6FF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Silkscreen, monospace',
              fontSize: 13,
              color: '#120E1A',
              letterSpacing: 2,
              boxShadow: '2px 2px 0 rgba(0,0,0,.5)',
              zIndex: 25,
            }}
          >
            HOLO
          </div>
        </div>
        <div className="hl-lab dp-label" style={{ top: 575, gap: 4 }}>
          <div
            style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 3,
              color: '#FFFFFF',
            }}
          >
            FINITION HOLO
          </div>
          <div className="dp-px" style={{ color: '#A79DB3' }}>
            MÊME CARTE · APPARENCE BRILLANTE
          </div>
        </div>
      </div>
    </div>
  );
}
