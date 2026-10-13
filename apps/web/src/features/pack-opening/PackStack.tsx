import type { CSSProperties } from 'react';
import { Logo } from '../../card/pixel';

/** Visuel d'un pack fermé (180 × 280), tel que dans la maquette. */
export function PackArt({ label }: { label: string }) {
  return (
    <div className="op-pack-art">
      <div className="op-pack-stripe" style={{ top: 0 }} />
      <div className="op-pack-stripe" style={{ bottom: 0 }} />
      <div className="op-pack-shine" />
      <Logo size={56} />
      <span className="wm" style={{ fontSize: 14, letterSpacing: 1 }}>
        <b>PIX</b>PEDIA
      </span>
      <div style={{ fontFamily: 'Silkscreen, monospace', fontSize: 9, color: '#A79DB3' }}>
        {label}
      </div>
    </div>
  );
}

/** Décalage du pack de rang k derrière celui de devant (maquette 7 packs). */
export const stackOffset = (k: number): CSSProperties => ({
  zIndex: 20 - k,
  transform: `translate(${7 * k}px, ${-7 * k}px) scale(${(1 - 0.035 * k).toFixed(3)})`,
  filter: `brightness(${(1 - 0.08 * k).toFixed(2)})`,
});

/** 1 pack qui flotte, ou N packs alignés les uns derrière les autres avec la pastille ×N. */
export function PackStack({ count, label }: { count: number; label: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => count - 1 - i).map((k) => (
        <div key={k} className="op-pack" style={stackOffset(k)}>
          <div
            className={k === 0 ? 'op-float' : undefined}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 12,
              boxShadow: '0 18px 30px rgba(0,0,0,0.55)',
            }}
          >
            <PackArt label={label} />
          </div>
        </div>
      ))}
      {count > 1 && <div className="op-badge">×{count}</div>}
    </>
  );
}
