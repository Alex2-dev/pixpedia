import type { CSSProperties } from 'react';
import { Px } from '../../../card/pixel';
import { HOF_CONFETTI, HOF_CONVERGE, HOF_FIREWORKS } from '../particles';
import { DropBack, DropFront, chanceLine, type SceneProps } from './shared';

const vars = (v: Record<string, string>) => v as CSSProperties;
const TITLE = 'HALL OF FAME';

/** Drop « spectaculaire », ~4,5 s (maquette : tableau Hall of Fame). */
export function HofDrop({ card, chance, ticker }: SceneProps) {
  const wave = (color: string) =>
    ({
      left: 95,
      top: 280,
      width: 200,
      height: 200,
      borderRadius: '50%',
      border: `5px solid ${color}`,
      boxShadow: `0 0 30px ${color}`,
    }) as const;
  const tickerText = ticker ?? `${card.name.toUpperCase()} REJOINT LE HALL OF FAME`;
  return (
    <div className="hf-shake dp-fill">
      <div className="hf-dim dp-fill" style={{ background: '#05030A' }} />
      <div className="dp-core">
        <div
          className="hf-rays dp-abs dp-loop"
          style={{
            left: -355,
            top: -170,
            width: 1100,
            height: 1100,
            borderRadius: '50%',
            background:
              'repeating-conic-gradient(from 0deg,rgba(46,230,255,.3) 0 6deg,transparent 6deg 15deg,rgba(160,92,255,.3) 15deg 21deg,transparent 21deg 30deg,rgba(255,79,176,.28) 30deg 36deg,transparent 36deg 45deg,rgba(255,210,63,.3) 45deg 51deg,transparent 51deg 60deg)',
            WebkitMaskImage: 'radial-gradient(circle,#000 0%,rgba(0,0,0,.6) 22%,transparent 50%)',
            maskImage: 'radial-gradient(circle,#000 0%,rgba(0,0,0,.6) 22%,transparent 50%)',
          }}
        />
        <div
          className="hf-aura dp-abs dp-loop"
          style={{
            left: 5,
            top: 190,
            width: 380,
            height: 380,
            borderRadius: '50%',
            background:
              'radial-gradient(circle,rgba(255,255,255,.35),rgba(160,92,255,.25) 40%,transparent 70%)',
          }}
        />
        {HOF_CONVERGE.map((p, i) => (
          <div
            key={i}
            className="hf-conv dp-abs"
            style={{
              left: p.left,
              top: p.top,
              width: p.w,
              height: p.h,
              background: p.color,
              animationDelay: `${p.delay}s`,
              ...vars({ '--x': `${p.x}px`, '--y': `${p.y}px` }),
            }}
          />
        ))}
        <div className="hf-sw1 dp-abs" style={wave('#2EE6FF')} />
        <div className="hf-sw2 dp-abs" style={wave('#FF4FB0')} />
        <div className="hf-sw3 dp-abs" style={wave('#FFD23F')} />
        <div className="dp-cardbox">
          <div className="hf-lev dp-fill">
            <div className="hf-rumble dp-fill">
              <div className="hf-back dp-fill" style={{ borderRadius: 14 }}>
                <DropBack />
                <svg
                  className="hf-crack"
                  viewBox="0 0 240 336"
                  style={{ position: 'absolute', inset: 0, width: 240, height: 336 }}
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="hf-rainbow" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#2EE6FF" />
                      <stop offset=".33" stopColor="#A05CFF" />
                      <stop offset=".66" stopColor="#FF4FB0" />
                      <stop offset="1" stopColor="#FFD23F" />
                    </linearGradient>
                  </defs>
                  <g
                    fill="none"
                    stroke="url(#hf-rainbow)"
                    strokeWidth="4"
                    style={{ filter: 'drop-shadow(0 0 8px #fff)' }}
                  >
                    <polyline
                      className="hf-c1"
                      points="120,0 104,70 138,130 96,190 130,260 110,336"
                    />
                    <polyline className="hf-c2" points="138,130 200,150 240,110" />
                    <polyline className="hf-c3" points="96,190 30,230 0,210" />
                    <polyline className="hf-c3" points="130,260 200,300 240,290" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div
            className="hf-glow dp-abs dp-loop"
            style={{
              inset: -24,
              borderRadius: 30,
              background: 'conic-gradient(from 200deg,#2EE6FF,#A05CFF,#FF4FB0,#FFD23F,#2EE6FF)',
              filter: 'blur(30px)',
            }}
          />
          <div className="hf-front dp-fill">
            <DropFront card={card} />
          </div>
          <div
            className="hf-trophy dp-abs"
            style={{
              left: '50%',
              top: -74,
              marginLeft: -28,
              filter: 'drop-shadow(0 0 12px rgba(255,210,63,.9))',
            }}
          >
            <Px name="trophy" color="#FFD23F" scale={7} />
          </div>
        </div>
      </div>
      <div className="hf-flash dp-fill" style={{ background: '#FFFFFF' }} />
      <div
        className="hf-flash2 dp-fill"
        style={{
          background:
            'conic-gradient(from 0deg at 50% 45%,#2EE6FF,#A05CFF,#FF4FB0,#FFD23F,#2EE6FF)',
        }}
      />
      <div className="dp-core">
        {HOF_FIREWORKS.map((p, i) => (
          <div
            key={i}
            className="hf-fw dp-abs"
            style={{
              left: p.left,
              top: p.top,
              width: p.w,
              height: p.h,
              background: p.color,
              animationDelay: `${p.delay}s`,
              ...vars({ '--dx': `${p.dx}px`, '--dy': `${p.dy}px` }),
            }}
          />
        ))}
      </div>
      {HOF_CONFETTI.map((p, i) => (
        <div
          key={i}
          className="hf-conf dp-abs dp-loop"
          style={{
            // Plein écran : la position de la maquette (sur 390 px) devient un pourcentage.
            left: `${((p.left / 390) * 100).toFixed(1)}%`,
            top: p.top,
            width: p.w,
            height: p.h,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <div className="dp-core">
        <div className="dp-label" style={{ top: 572, gap: 6 }}>
          <div
            aria-label={TITLE}
            style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 700,
              fontSize: 30,
              letterSpacing: 3,
              color: '#FFD23F',
              textShadow: '3px 3px 0 #7A4A00,0 0 18px rgba(255,210,63,.7)',
              whiteSpace: 'nowrap',
            }}
          >
            {[...TITLE].map((ch, i) => (
              <span
                key={i}
                className="hf-let"
                style={{ animationDelay: `${(2.75 + i * 0.06).toFixed(2)}s` }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>
          <div className="hf-pct dp-px" style={{ color: '#FFE9A8' }}>
            {chanceLine(chance)}
          </div>
        </div>
      </div>
      <div
        className="hf-ticker dp-abs"
        style={{
          left: 0,
          right: 0,
          // Sous la carte, comme dans la maquette (y = 640 sur 844), mais sur toute la largeur.
          top: 'calc(50% + 218px * var(--dp-scale, 1))',
          height: 'calc(26px * var(--dp-scale, 1))',
          background: '#FFD23F',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="hf-tick dp-loop"
          style={{
            whiteSpace: 'nowrap',
            fontFamily: 'Silkscreen, monospace',
            fontSize: 'calc(11px * var(--dp-scale, 1))',
            color: '#120E1A',
          }}
        >
          ★ ANNONCÉ À TOUTE LA COMMUNAUTÉ ★ {tickerText} ★ ANNONCÉ À TOUTE LA COMMUNAUTÉ ★{' '}
          {tickerText} ★
        </div>
      </div>
    </div>
  );
}
