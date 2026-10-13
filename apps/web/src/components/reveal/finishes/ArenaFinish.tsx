import { DropBack, DropFront, type SceneProps } from '../drops/shared';

/** Hauteur de chaque silhouette du public (y = 16 + chiffre), 130 colonnes de 3 px. */
const CROWD =
  '8424885684262628284662424525466282554226565252822656855658454546486866588456246642444828588882256246286865428555584682826654488626';
/** Flashs photo : [x, y, délai]. */
const BULBS: [number, number, number][] = [
  [126, 654, 3.81],
  [74, 609, 3.16],
  [53, 595, 2.02],
  [269, 613, 2.4],
  [25, 677, 2.62],
  [209, 686, 2.83],
  [216, 582, 2.61],
  [20, 628, 2.7],
  [252, 657, 3.22],
  [349, 626, 1.64],
];

/** Édition Arène, ~2,1 s : salle éteinte, LED, projecteurs, retournement, public et flashs. */
export function ArenaFinish({ card }: SceneProps) {
  const event = (card.eventName ?? 'Événement').toUpperCase();
  const ticker = Array.from({ length: 3 }, () => `★ ÉDITION ARÈNE ★ ${event}`).join(' ') + ' ★';
  return (
    <div className="dp-fill">
      <div
        className="ae-dim dp-fill"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 100%,#3A1A5A,#07040D 70%)' }}
      />
      <div className="dp-core">
        <div
          className="ae-led dp-abs"
          style={{
            left: -1200,
            right: -1200,
            top: 92,
            height: 24,
            background: '#0B0714',
            borderTop: '1px solid #FF4FB0',
            borderBottom: '1px solid #2EE6FF',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            className="ae-tick dp-loop"
            style={{
              whiteSpace: 'nowrap',
              fontFamily: 'Silkscreen, monospace',
              fontSize: 11,
              color: '#FF4FB0',
            }}
          >
            {ticker}
          </div>
        </div>
        <div
          className="ae-spotL dp-abs"
          style={{
            left: -60,
            top: -40,
            width: 120,
            height: 700,
            background: 'linear-gradient(180deg,rgba(46,230,255,.5),transparent 90%)',
            transformOrigin: 'top center',
            filter: 'blur(2px)',
          }}
        />
        <div
          className="ae-spotR dp-abs"
          style={{
            right: -60,
            top: -40,
            width: 120,
            height: 700,
            background: 'linear-gradient(180deg,rgba(255,79,176,.5),transparent 90%)',
            transformOrigin: 'top center',
            filter: 'blur(2px)',
          }}
        />
        <div
          className="ae-pool dp-abs"
          style={{
            left: 55,
            top: 520,
            width: 280,
            height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse,rgba(255,255,255,.35),transparent 70%)',
          }}
        />
        <div className="dp-cardbox">
          <div className="ae-back dp-fill">
            <DropBack />
          </div>
          <div className="ae-front dp-fill">
            <DropFront card={card} />
          </div>
        </div>
        {/* Public en pleine largeur : le motif de la maquette (390 px) répété de chaque côté. */}
        <svg
          className="ae-crowd"
          viewBox="0 0 2730 30"
          preserveAspectRatio="none"
          shapeRendering="crispEdges"
          aria-hidden="true"
          style={{ position: 'absolute', left: -1170, bottom: 150, width: 2730, height: 60 }}
        >
          <defs>
            <pattern id="ae-crowd-row" width={390} height={30} patternUnits="userSpaceOnUse">
              <g fill="#05030A">
                {[...CROWD].map((d, i) => (
                  <rect key={i} x={i * 3} y={16 + Number(d)} width={3} height={14 - Number(d)} />
                ))}
              </g>
            </pattern>
          </defs>
          <rect width={2730} height={30} fill="url(#ae-crowd-row)" />
        </svg>
        {BULBS.map(([left, top, delay], i) => (
          <div
            key={i}
            className="ae-bulb dp-abs"
            style={{
              left,
              top,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 0 12px #fff',
              animationDelay: `calc(${delay}s - var(--after, 0s))`,
            }}
          />
        ))}
        <div className="ae-title dp-label" style={{ top: 575, gap: 4 }}>
          <div
            style={{
              fontFamily: 'Cinzel, serif',
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 3,
              color: '#fff',
              textShadow: '0 0 12px #FF4FB0, 0 0 24px #A05CFF',
            }}
          >
            ÉDITION ARÈNE
          </div>
          <div className="dp-px" style={{ color: '#2EE6FF' }}>
            LIÉE AU COMPTE · APPARENCE EXCLUSIVE
          </div>
        </div>
      </div>
    </div>
  );
}
