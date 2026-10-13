import { DropBack, DropFront, chanceLine, type DropSceneProps } from './shared';

/** Drop « simple », ~1,4 s (maquette : tableau Boss). */
export function BossDrop({ card, chance }: DropSceneProps) {
  return (
    <div className="bs-shake dp-fill">
      <div
        className="bs-dim dp-fill"
        style={{ background: 'radial-gradient(circle at 50% 45%,#2A1840,#0B0812 70%)' }}
      />
      <div className="dp-core">
        <div
          className="bs-ring dp-abs"
          style={{
            left: 95,
            top: 280,
            width: 200,
            height: 200,
            borderRadius: '50%',
            border: '4px solid #A05CFF',
            boxShadow: '0 0 24px #A05CFF',
          }}
        />
      </div>
      <div
        className="bs-flash dp-fill"
        style={{
          background:
            'radial-gradient(circle at 50% 45%,rgba(160,92,255,.85),rgba(160,92,255,0) 60%)',
        }}
      />
      <div className="dp-core">
        <div className="dp-cardbox">
          <div
            className="bs-glow dp-abs dp-loop"
            style={{ inset: -18, borderRadius: 24, background: '#A05CFF', filter: 'blur(26px)' }}
          />
          <div className="bs-back dp-fill">
            <DropBack />
          </div>
          <div className="bs-front dp-fill">
            <DropFront card={card} />
          </div>
        </div>
        <div className="bs-lab dp-label" style={{ top: 575, gap: 4 }}>
          <div
            style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 3,
              color: '#A05CFF',
            }}
          >
            BOSS
          </div>
          <div className="dp-px" style={{ color: '#A79DB3' }}>
            {chanceLine(chance)}
          </div>
        </div>
      </div>
    </div>
  );
}
