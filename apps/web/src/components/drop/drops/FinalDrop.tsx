import type { CSSProperties } from 'react';
import { Px } from '../../../card/pixel';
import { FINAL_EMBERS, FINAL_FRAGS, FINAL_SPARKS } from '../particles';
import { DropBack, DropFront, chanceLine, type DropSceneProps } from './shared';

const vars = (v: Record<string, string>) => v as CSSProperties;

/** Drop « stylé », ~3 s (maquette : tableau Boss final). */
export function FinalDrop({ card, chance }: DropSceneProps) {
  const ring = { left: 95, top: 280, width: 200, height: 200, borderRadius: '50%' } as const;
  return (
    <div className="ff-shake dp-fill">
      <div
        className="ff-dim dp-fill"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 60%,#3A1608,#0A0604 75%)' }}
      />
      <div
        className="ff-heat dp-abs dp-loop"
        style={{
          left: -40,
          right: -40,
          bottom: -60,
          height: 380,
          background:
            'radial-gradient(ellipse 60% 70% at 50% 100%,rgba(255,138,61,.55),rgba(255,138,61,0) 70%)',
        }}
      />
      <div
        className="ff-ring dp-abs"
        style={{
          ...ring,
          border: '6px solid #FF8A3D',
          boxShadow: '0 0 30px #FF8A3D,inset 0 0 20px #FFB13D',
        }}
      />
      <div className="ff-ring2 dp-abs" style={{ ...ring, border: '3px solid #FFE08A' }} />
      {FINAL_SPARKS.map((p, i) => (
        <div
          key={i}
          className="ff-spark dp-abs"
          style={{
            left: p.left,
            top: p.top,
            width: p.w,
            height: p.h,
            background: p.color,
            ...vars({ '--dx': `${p.dx}px`, '--dy': `${p.dy}px` }),
          }}
        />
      ))}
      <div className="dp-cardbox">
        <div className="ff-backwrap dp-fill">
          <div className="ff-back dp-fill" style={{ borderRadius: 14 }}>
            <DropBack />
            <svg
              className="ff-crack"
              viewBox="0 0 240 336"
              style={{ position: 'absolute', inset: 0, width: 240, height: 336 }}
              aria-hidden="true"
            >
              <polyline
                points="120,0 108,60 132,110 100,170 128,230 112,336"
                fill="none"
                stroke="#FFB13D"
                strokeWidth="4"
                style={{ filter: 'drop-shadow(0 0 6px #FF8A3D)' }}
              />
              <polyline
                points="132,110 190,140 240,128"
                fill="none"
                stroke="#FFB13D"
                strokeWidth="3"
              />
              <polyline
                points="100,170 40,200 0,190"
                fill="none"
                stroke="#FFB13D"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>
        <div
          className="ff-glow dp-abs dp-loop"
          style={{ inset: -20, borderRadius: 26, background: '#FF8A3D', filter: 'blur(30px)' }}
        />
        <div className="ff-front dp-fill">
          <div className="ff-squash">
            <DropFront card={card} />
          </div>
        </div>
        <div
          className="ff-crown dp-abs"
          style={{
            left: '50%',
            top: -58,
            marginLeft: -26,
            filter: 'drop-shadow(0 0 10px rgba(255,177,61,.9))',
          }}
        >
          <Px name="final" color="#FFC46B" scale={6.5} />
        </div>
      </div>
      {FINAL_FRAGS.map((p, i) => (
        <div
          key={i}
          className="ff-frag dp-abs"
          style={{
            left: p.left,
            top: p.top,
            width: p.w,
            height: p.h,
            background: p.color,
            ...vars({ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--r': `${p.r}deg` }),
          }}
        />
      ))}
      <div
        className="ff-flash dp-fill"
        style={{
          background:
            'radial-gradient(circle at 50% 45%,#FFF3D6,rgba(255,177,61,.85) 35%,rgba(255,138,61,0) 70%)',
        }}
      />
      {FINAL_EMBERS.map((p, i) => (
        <div
          key={i}
          className="ff-ember dp-abs dp-loop"
          style={{
            left: p.left,
            top: p.top,
            width: p.w,
            height: p.h,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <div className="ff-title dp-label" style={{ top: 575, gap: 6 }}>
        <div
          style={{
            fontFamily: 'Cinzel, serif',
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: 4,
            color: '#FFC46B',
            textShadow: '3px 3px 0 #7A2E12',
          }}
        >
          BOSS FINAL
        </div>
        <div
          className="ff-line"
          style={{
            height: 4,
            width: 180,
            background: 'repeating-linear-gradient(90deg,#FF8A3D 0 8px,#FFB13D 8px 16px)',
          }}
        />
        <div className="ff-pct dp-px" style={{ color: '#FFC48F' }}>
          {chanceLine(chance)}
        </div>
      </div>
    </div>
  );
}
