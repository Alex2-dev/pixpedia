/*
 * Dos des cartes, générés depuis docs/design/pixpedia-cartes-animations.html (balisage exact
 * de la maquette converti en JSX). Ne pas retoucher à la main : régénérer depuis la maquette.
 * Seul le nom de l'événement du dos Arène est dynamique.
 */
import type { CSSProperties } from 'react';
import type { CardBackKind } from '@pixpedia/shared';

/** Dos standard : Starter, Bonus, Combo, et seul dos utilisé pendant l'ouverture. */
export function StandardBack() {
  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '240px',
          height: '336px',
          borderRadius: '14px',
          background: '#4FE3D1',
          padding: '4px',
          boxSizing: 'border-box',
          boxShadow: '3px 3px 0 rgba(0,0,0,.5),0 22px 34px rgba(0,0,0,.55)',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: '100%',
            borderRadius: '11px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            background:
              'radial-gradient(ellipse 60% 45% at 50% 45%,rgba(79,227,209,.18),transparent 70%),#1E1828',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0',
              backgroundImage:
                'linear-gradient(rgba(79,227,209,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(79,227,209,.07) 1px,transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              inset: '10px',
              border: '1px solid #3A3147',
              borderRadius: '8px',
            }}
          ></div>
          <div style={{ position: 'relative' }}>
            <svg
              width="89"
              height="96"
              viewBox="0 0 12 13"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="2" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="12" width="1" height="1" fill="#EADFC8" />
            </svg>
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                fontFamily: 'Silkscreen,monospace',
                fontSize: '22px',
                letterSpacing: '1px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#4FE3D1' }}>PIX</span>
              <span style={{ color: '#EADFC8' }}>PEDIA</span>
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              fontFamily: 'Cinzel,serif',
              fontWeight: '700',
              fontSize: '9px',
              letterSpacing: '3px',
              color: '#A79DB3',
            }}
          >
            CARTE DE COLLECTION
          </div>
        </div>
      </div>
    </>
  );
}

/** Créneaux, triple crâne, pierre violette. */
export function BossBack() {
  return (
    <>
      <div
        className="c-card"
        style={{
          position: 'relative',
          width: '240px',
          height: '336px',
          filter:
            'drop-shadow(3px 3px 0 rgba(0,0,0,.5)) drop-shadow(0 0 22px rgba(160,92,255,.5)) drop-shadow(0 20px 26px rgba(0,0,0,.5))',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '10px',
            right: '10px',
            top: '-8px',
            height: '10px',
            background: 'repeating-linear-gradient(90deg,#A05CFF 0 10px,transparent 10px 20px)',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            inset: '0',
            borderRadius: '6px',
            background: 'linear-gradient(180deg,#B57BFF,#7A3FD6)',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            inset: '7px',
            borderRadius: '3px',
            overflow: 'hidden',
            background:
              'radial-gradient(ellipse 70% 50% at 50% 45%,rgba(160,92,255,.35),transparent 70%),#150E20',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0',
              backgroundImage:
                'linear-gradient(rgba(160,92,255,.10) 2px,transparent 2px),linear-gradient(90deg,rgba(160,92,255,.10) 2px,transparent 2px)',
              backgroundSize: '24px 16px',
              backgroundPosition: '0 0,12px 0',
            }}
          ></div>
          <div style={{ position: 'absolute', inset: '8px', border: '2px solid #4A2A7A' }}></div>
          <div style={{ position: 'relative', opacity: '.9' }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 8 8"
              fill="#A05CFF"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="1" y="0" width="1" height="1" />
              <rect x="2" y="0" width="1" height="1" />
              <rect x="3" y="0" width="1" height="1" />
              <rect x="4" y="0" width="1" height="1" />
              <rect x="5" y="0" width="1" height="1" />
              <rect x="6" y="0" width="1" height="1" />
              <rect x="0" y="1" width="1" height="1" />
              <rect x="1" y="1" width="1" height="1" />
              <rect x="2" y="1" width="1" height="1" />
              <rect x="3" y="1" width="1" height="1" />
              <rect x="4" y="1" width="1" height="1" />
              <rect x="5" y="1" width="1" height="1" />
              <rect x="6" y="1" width="1" height="1" />
              <rect x="7" y="1" width="1" height="1" />
              <rect x="0" y="2" width="1" height="1" />
              <rect x="1" y="2" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="2" width="1" height="1" />
              <rect x="6" y="2" width="1" height="1" />
              <rect x="7" y="2" width="1" height="1" />
              <rect x="0" y="3" width="1" height="1" />
              <rect x="3" y="3" width="1" height="1" />
              <rect x="4" y="3" width="1" height="1" />
              <rect x="7" y="3" width="1" height="1" />
              <rect x="0" y="4" width="1" height="1" />
              <rect x="1" y="4" width="1" height="1" />
              <rect x="2" y="4" width="1" height="1" />
              <rect x="3" y="4" width="1" height="1" />
              <rect x="4" y="4" width="1" height="1" />
              <rect x="5" y="4" width="1" height="1" />
              <rect x="6" y="4" width="1" height="1" />
              <rect x="7" y="4" width="1" height="1" />
              <rect x="1" y="5" width="1" height="1" />
              <rect x="2" y="5" width="1" height="1" />
              <rect x="3" y="5" width="1" height="1" />
              <rect x="4" y="5" width="1" height="1" />
              <rect x="5" y="5" width="1" height="1" />
              <rect x="6" y="5" width="1" height="1" />
              <rect x="1" y="6" width="1" height="1" />
              <rect x="3" y="6" width="1" height="1" />
              <rect x="4" y="6" width="1" height="1" />
              <rect x="6" y="6" width="1" height="1" />
            </svg>
          </div>
          <div style={{ position: 'relative', marginTop: '-6px' }}>
            <svg
              width="50"
              height="54"
              viewBox="0 0 12 13"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="3" width="1" height="1" fill="#A05CFF" />
              <rect x="6" y="3" width="1" height="1" fill="#A05CFF" />
              <rect x="11" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="4" width="1" height="1" fill="#A05CFF" />
              <rect x="5" y="4" width="1" height="1" fill="#A05CFF" />
              <rect x="6" y="4" width="1" height="1" fill="#A05CFF" />
              <rect x="7" y="4" width="1" height="1" fill="#A05CFF" />
              <rect x="11" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="5" width="1" height="1" fill="#A05CFF" />
              <rect x="4" y="5" width="1" height="1" fill="#A05CFF" />
              <rect x="5" y="5" width="1" height="1" fill="#A05CFF" />
              <rect x="6" y="5" width="1" height="1" fill="#A05CFF" />
              <rect x="7" y="5" width="1" height="1" fill="#A05CFF" />
              <rect x="8" y="5" width="1" height="1" fill="#A05CFF" />
              <rect x="11" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="6" width="1" height="1" fill="#A05CFF" />
              <rect x="4" y="6" width="1" height="1" fill="#A05CFF" />
              <rect x="5" y="6" width="1" height="1" fill="#A05CFF" />
              <rect x="6" y="6" width="1" height="1" fill="#A05CFF" />
              <rect x="7" y="6" width="1" height="1" fill="#A05CFF" />
              <rect x="8" y="6" width="1" height="1" fill="#A05CFF" />
              <rect x="11" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="7" width="1" height="1" fill="#A05CFF" />
              <rect x="5" y="7" width="1" height="1" fill="#A05CFF" />
              <rect x="6" y="7" width="1" height="1" fill="#A05CFF" />
              <rect x="7" y="7" width="1" height="1" fill="#A05CFF" />
              <rect x="11" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="8" width="1" height="1" fill="#A05CFF" />
              <rect x="6" y="8" width="1" height="1" fill="#A05CFF" />
              <rect x="11" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="2" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="12" width="1" height="1" fill="#EADFC8" />
            </svg>
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                fontFamily: 'Silkscreen,monospace',
                fontSize: '18px',
                letterSpacing: '1px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#4FE3D1' }}>PIX</span>
              <span style={{ color: '#EADFC8' }}>PEDIA</span>
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              fontFamily: 'Silkscreen,monospace',
              fontSize: '9px',
              letterSpacing: '2px',
              color: '#C9A8FF',
            }}
          >
            ÉDITION BOSS
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '-16px',
            transform: 'translateX(-50%)',
            background: '#150E20',
            border: '2px solid #A05CFF',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: '4',
          }}
        >
          <svg
            width="14.0"
            height="14.0"
            viewBox="0 0 8 8"
            fill="#A05CFF"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="1" y="0" width="1" height="1" />
            <rect x="2" y="0" width="1" height="1" />
            <rect x="3" y="0" width="1" height="1" />
            <rect x="4" y="0" width="1" height="1" />
            <rect x="5" y="0" width="1" height="1" />
            <rect x="6" y="0" width="1" height="1" />
            <rect x="0" y="1" width="1" height="1" />
            <rect x="1" y="1" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="4" y="1" width="1" height="1" />
            <rect x="5" y="1" width="1" height="1" />
            <rect x="6" y="1" width="1" height="1" />
            <rect x="7" y="1" width="1" height="1" />
            <rect x="0" y="2" width="1" height="1" />
            <rect x="1" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="7" y="2" width="1" height="1" />
            <rect x="0" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="7" y="3" width="1" height="1" />
            <rect x="0" y="4" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="7" y="4" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
          </svg>
          <svg
            width="14.0"
            height="14.0"
            viewBox="0 0 8 8"
            fill="#A05CFF"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="1" y="0" width="1" height="1" />
            <rect x="2" y="0" width="1" height="1" />
            <rect x="3" y="0" width="1" height="1" />
            <rect x="4" y="0" width="1" height="1" />
            <rect x="5" y="0" width="1" height="1" />
            <rect x="6" y="0" width="1" height="1" />
            <rect x="0" y="1" width="1" height="1" />
            <rect x="1" y="1" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="4" y="1" width="1" height="1" />
            <rect x="5" y="1" width="1" height="1" />
            <rect x="6" y="1" width="1" height="1" />
            <rect x="7" y="1" width="1" height="1" />
            <rect x="0" y="2" width="1" height="1" />
            <rect x="1" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="7" y="2" width="1" height="1" />
            <rect x="0" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="7" y="3" width="1" height="1" />
            <rect x="0" y="4" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="7" y="4" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
          </svg>
          <svg
            width="14.0"
            height="14.0"
            viewBox="0 0 8 8"
            fill="#A05CFF"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="1" y="0" width="1" height="1" />
            <rect x="2" y="0" width="1" height="1" />
            <rect x="3" y="0" width="1" height="1" />
            <rect x="4" y="0" width="1" height="1" />
            <rect x="5" y="0" width="1" height="1" />
            <rect x="6" y="0" width="1" height="1" />
            <rect x="0" y="1" width="1" height="1" />
            <rect x="1" y="1" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="4" y="1" width="1" height="1" />
            <rect x="5" y="1" width="1" height="1" />
            <rect x="6" y="1" width="1" height="1" />
            <rect x="7" y="1" width="1" height="1" />
            <rect x="0" y="2" width="1" height="1" />
            <rect x="1" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="7" y="2" width="1" height="1" />
            <rect x="0" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="7" y="3" width="1" height="1" />
            <rect x="0" y="4" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="7" y="4" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-sheen"
          style={
            {
              position: 'absolute',
              inset: '0',
              borderRadius: '6px',
              overflow: 'hidden',
              pointerEvents: 'none',
              '--sh': 'rgba(220,190,255,.28)',
              '--shd': '4.5s',
            } as CSSProperties
          }
        ></div>
      </div>
    </>
  );
}

/** Couronne, braises, flammes pixel animées, ruban. */
export function FinalBack() {
  return (
    <>
      <div
        className="c-card"
        style={{
          position: 'relative',
          width: '240px',
          height: '336px',
          filter:
            'drop-shadow(3px 3px 0 rgba(0,0,0,.5)) drop-shadow(0 0 26px rgba(255,138,61,.55)) drop-shadow(0 20px 26px rgba(0,0,0,.5))',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '0',
            borderRadius: '10px',
            background: 'linear-gradient(180deg,#FFC46B,#FF8A3D 40%,#C2410C)',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            inset: '6px',
            borderRadius: '6px',
            overflow: 'hidden',
            background:
              'radial-gradient(ellipse 80% 55% at 50% 100%,rgba(255,138,61,.55),transparent 70%),radial-gradient(ellipse 60% 40% at 50% 42%,rgba(255,196,107,.25),transparent 70%),#1A0F0A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0',
              backgroundImage:
                'repeating-linear-gradient(45deg,rgba(255,138,61,.06) 0 6px,transparent 6px 12px)',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              inset: '8px',
              border: '1px solid #7A2E12',
              borderRadius: '4px',
            }}
          ></div>
          <div
            className="c-ember"
            style={{
              position: 'absolute',
              left: '40px',
              bottom: '30px',
              width: '3px',
              height: '3px',
              background: '#FFB13D',
              animationDelay: '0s',
            }}
          ></div>
          <div
            className="c-ember"
            style={{
              position: 'absolute',
              left: '90px',
              bottom: '30px',
              width: '3px',
              height: '3px',
              background: '#FFB13D',
              animationDelay: '0.8s',
            }}
          ></div>
          <div
            className="c-ember"
            style={{
              position: 'absolute',
              left: '150px',
              bottom: '30px',
              width: '3px',
              height: '3px',
              background: '#FFB13D',
              animationDelay: '0.4s',
            }}
          ></div>
          <div
            className="c-ember"
            style={{
              position: 'absolute',
              left: '200px',
              bottom: '30px',
              width: '3px',
              height: '3px',
              background: '#FFB13D',
              animationDelay: '1.2s',
            }}
          ></div>
          <div
            className="c-ember"
            style={{
              position: 'absolute',
              left: '120px',
              bottom: '30px',
              width: '3px',
              height: '3px',
              background: '#FFB13D',
              animationDelay: '1.6s',
            }}
          ></div>
          <div
            className="c-ember"
            style={{
              position: 'absolute',
              left: '70px',
              bottom: '30px',
              width: '3px',
              height: '3px',
              background: '#FFB13D',
              animationDelay: '2s',
            }}
          ></div>
          <div
            style={{ position: 'relative', filter: 'drop-shadow(0 0 10px rgba(255,177,61,.8))' }}
          >
            <svg
              width="48"
              height="36"
              viewBox="0 0 8 6"
              fill="#FFC46B"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="0" y="0" width="1" height="1" />
              <rect x="3" y="0" width="1" height="1" />
              <rect x="4" y="0" width="1" height="1" />
              <rect x="7" y="0" width="1" height="1" />
              <rect x="0" y="1" width="1" height="1" />
              <rect x="1" y="1" width="1" height="1" />
              <rect x="3" y="1" width="1" height="1" />
              <rect x="4" y="1" width="1" height="1" />
              <rect x="6" y="1" width="1" height="1" />
              <rect x="7" y="1" width="1" height="1" />
              <rect x="0" y="2" width="1" height="1" />
              <rect x="1" y="2" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="2" width="1" height="1" />
              <rect x="5" y="2" width="1" height="1" />
              <rect x="6" y="2" width="1" height="1" />
              <rect x="7" y="2" width="1" height="1" />
              <rect x="0" y="3" width="1" height="1" />
              <rect x="1" y="3" width="1" height="1" />
              <rect x="2" y="3" width="1" height="1" />
              <rect x="3" y="3" width="1" height="1" />
              <rect x="4" y="3" width="1" height="1" />
              <rect x="5" y="3" width="1" height="1" />
              <rect x="6" y="3" width="1" height="1" />
              <rect x="7" y="3" width="1" height="1" />
              <rect x="1" y="4" width="1" height="1" />
              <rect x="2" y="4" width="1" height="1" />
              <rect x="3" y="4" width="1" height="1" />
              <rect x="4" y="4" width="1" height="1" />
              <rect x="5" y="4" width="1" height="1" />
              <rect x="6" y="4" width="1" height="1" />
              <rect x="1" y="5" width="1" height="1" />
              <rect x="2" y="5" width="1" height="1" />
              <rect x="3" y="5" width="1" height="1" />
              <rect x="4" y="5" width="1" height="1" />
              <rect x="5" y="5" width="1" height="1" />
              <rect x="6" y="5" width="1" height="1" />
            </svg>
          </div>
          <div style={{ position: 'relative', marginTop: '-4px' }}>
            <svg
              width="57"
              height="62"
              viewBox="0 0 12 13"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" fill="#FFE7CF" />
              <rect x="3" y="0" width="1" height="1" fill="#FFE7CF" />
              <rect x="4" y="0" width="1" height="1" fill="#FFE7CF" />
              <rect x="5" y="0" width="1" height="1" fill="#FFE7CF" />
              <rect x="6" y="0" width="1" height="1" fill="#FFE7CF" />
              <rect x="7" y="0" width="1" height="1" fill="#FFE7CF" />
              <rect x="8" y="0" width="1" height="1" fill="#FFE7CF" />
              <rect x="9" y="0" width="1" height="1" fill="#FFE7CF" />
              <rect x="1" y="1" width="1" height="1" fill="#FFE7CF" />
              <rect x="10" y="1" width="1" height="1" fill="#FFE7CF" />
              <rect x="0" y="2" width="1" height="1" fill="#FFE7CF" />
              <rect x="11" y="2" width="1" height="1" fill="#FFE7CF" />
              <rect x="0" y="3" width="1" height="1" fill="#FFE7CF" />
              <rect x="5" y="3" width="1" height="1" fill="#FF8A3D" />
              <rect x="6" y="3" width="1" height="1" fill="#FF8A3D" />
              <rect x="11" y="3" width="1" height="1" fill="#FFE7CF" />
              <rect x="0" y="4" width="1" height="1" fill="#FFE7CF" />
              <rect x="4" y="4" width="1" height="1" fill="#FF8A3D" />
              <rect x="5" y="4" width="1" height="1" fill="#FF8A3D" />
              <rect x="6" y="4" width="1" height="1" fill="#FF8A3D" />
              <rect x="7" y="4" width="1" height="1" fill="#FF8A3D" />
              <rect x="11" y="4" width="1" height="1" fill="#FFE7CF" />
              <rect x="0" y="5" width="1" height="1" fill="#FFE7CF" />
              <rect x="3" y="5" width="1" height="1" fill="#FF8A3D" />
              <rect x="4" y="5" width="1" height="1" fill="#FF8A3D" />
              <rect x="5" y="5" width="1" height="1" fill="#FF8A3D" />
              <rect x="6" y="5" width="1" height="1" fill="#FF8A3D" />
              <rect x="7" y="5" width="1" height="1" fill="#FF8A3D" />
              <rect x="8" y="5" width="1" height="1" fill="#FF8A3D" />
              <rect x="11" y="5" width="1" height="1" fill="#FFE7CF" />
              <rect x="0" y="6" width="1" height="1" fill="#FFE7CF" />
              <rect x="3" y="6" width="1" height="1" fill="#FF8A3D" />
              <rect x="4" y="6" width="1" height="1" fill="#FF8A3D" />
              <rect x="5" y="6" width="1" height="1" fill="#FF8A3D" />
              <rect x="6" y="6" width="1" height="1" fill="#FF8A3D" />
              <rect x="7" y="6" width="1" height="1" fill="#FF8A3D" />
              <rect x="8" y="6" width="1" height="1" fill="#FF8A3D" />
              <rect x="11" y="6" width="1" height="1" fill="#FFE7CF" />
              <rect x="0" y="7" width="1" height="1" fill="#FFE7CF" />
              <rect x="4" y="7" width="1" height="1" fill="#FF8A3D" />
              <rect x="5" y="7" width="1" height="1" fill="#FF8A3D" />
              <rect x="6" y="7" width="1" height="1" fill="#FF8A3D" />
              <rect x="7" y="7" width="1" height="1" fill="#FF8A3D" />
              <rect x="11" y="7" width="1" height="1" fill="#FFE7CF" />
              <rect x="0" y="8" width="1" height="1" fill="#FFE7CF" />
              <rect x="5" y="8" width="1" height="1" fill="#FF8A3D" />
              <rect x="6" y="8" width="1" height="1" fill="#FF8A3D" />
              <rect x="11" y="8" width="1" height="1" fill="#FFE7CF" />
              <rect x="0" y="9" width="1" height="1" fill="#FFE7CF" />
              <rect x="11" y="9" width="1" height="1" fill="#FFE7CF" />
              <rect x="0" y="10" width="1" height="1" fill="#FFE7CF" />
              <rect x="11" y="10" width="1" height="1" fill="#FFE7CF" />
              <rect x="1" y="11" width="1" height="1" fill="#FFE7CF" />
              <rect x="10" y="11" width="1" height="1" fill="#FFE7CF" />
              <rect x="2" y="12" width="1" height="1" fill="#FFE7CF" />
              <rect x="3" y="12" width="1" height="1" fill="#FFE7CF" />
              <rect x="4" y="12" width="1" height="1" fill="#FFE7CF" />
              <rect x="5" y="12" width="1" height="1" fill="#FFE7CF" />
              <rect x="6" y="12" width="1" height="1" fill="#FFE7CF" />
              <rect x="7" y="12" width="1" height="1" fill="#FFE7CF" />
              <rect x="8" y="12" width="1" height="1" fill="#FFE7CF" />
              <rect x="9" y="12" width="1" height="1" fill="#FFE7CF" />
            </svg>
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                fontFamily: 'Silkscreen,monospace',
                fontSize: '18px',
                letterSpacing: '1px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#4FE3D1' }}>PIX</span>
              <span style={{ color: '#EADFC8' }}>PEDIA</span>
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              background: '#FF8A3D',
              color: '#1A0F0A',
              padding: '3px 14px',
              fontFamily: 'Silkscreen,monospace',
              fontSize: '9px',
              letterSpacing: '1px',
              clipPath:
                'polygon(6px 0,calc(100% - 6px) 0,100% 50%,calc(100% - 6px) 100%,6px 100%,0 50%)',
            }}
          >
            ÉDITION BOSS FINAL
          </div>
        </div>
        <div
          className="c-flame"
          style={{ position: 'absolute', bottom: '-12px', left: '4px', animationDelay: '0s' }}
        >
          <svg
            width="24"
            height="21"
            viewBox="0 0 8 7"
            fill="#FF8A3D"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="3" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="1" y="3" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="5" y="3" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="0" y="5" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="7" y="5" width="1" height="1" />
            <rect x="0" y="6" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="2" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="5" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
            <rect x="7" y="6" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-flame"
          style={{ position: 'absolute', bottom: '-12px', left: '40px', animationDelay: '0.3s' }}
        >
          <svg
            width="24"
            height="21"
            viewBox="0 0 8 7"
            fill="#FFB13D"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="3" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="1" y="3" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="5" y="3" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="0" y="5" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="7" y="5" width="1" height="1" />
            <rect x="0" y="6" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="2" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="5" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
            <rect x="7" y="6" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-flame"
          style={{ position: 'absolute', bottom: '-12px', left: '76px', animationDelay: '0.15s' }}
        >
          <svg
            width="24"
            height="21"
            viewBox="0 0 8 7"
            fill="#FF6A2D"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="3" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="1" y="3" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="5" y="3" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="0" y="5" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="7" y="5" width="1" height="1" />
            <rect x="0" y="6" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="2" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="5" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
            <rect x="7" y="6" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-flame"
          style={{ position: 'absolute', bottom: '-12px', left: '112px', animationDelay: '0.45s' }}
        >
          <svg
            width="24"
            height="21"
            viewBox="0 0 8 7"
            fill="#FF8A3D"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="3" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="1" y="3" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="5" y="3" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="0" y="5" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="7" y="5" width="1" height="1" />
            <rect x="0" y="6" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="2" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="5" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
            <rect x="7" y="6" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-flame"
          style={{ position: 'absolute', bottom: '-12px', left: '148px', animationDelay: '0.2s' }}
        >
          <svg
            width="24"
            height="21"
            viewBox="0 0 8 7"
            fill="#FFB13D"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="3" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="1" y="3" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="5" y="3" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="0" y="5" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="7" y="5" width="1" height="1" />
            <rect x="0" y="6" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="2" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="5" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
            <rect x="7" y="6" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-flame"
          style={{ position: 'absolute', bottom: '-12px', left: '184px', animationDelay: '0.35s' }}
        >
          <svg
            width="24"
            height="21"
            viewBox="0 0 8 7"
            fill="#FF6A2D"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="3" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="1" y="3" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="5" y="3" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="0" y="5" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="7" y="5" width="1" height="1" />
            <rect x="0" y="6" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="2" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="5" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
            <rect x="7" y="6" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-flame"
          style={{ position: 'absolute', bottom: '-12px', left: '214px', animationDelay: '0.1s' }}
        >
          <svg
            width="24"
            height="21"
            viewBox="0 0 8 7"
            fill="#FF8A3D"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="3" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="3" y="1" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="6" y="2" width="1" height="1" />
            <rect x="1" y="3" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="4" y="3" width="1" height="1" />
            <rect x="5" y="3" width="1" height="1" />
            <rect x="1" y="4" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
            <rect x="3" y="4" width="1" height="1" />
            <rect x="4" y="4" width="1" height="1" />
            <rect x="5" y="4" width="1" height="1" />
            <rect x="6" y="4" width="1" height="1" />
            <rect x="0" y="5" width="1" height="1" />
            <rect x="1" y="5" width="1" height="1" />
            <rect x="2" y="5" width="1" height="1" />
            <rect x="3" y="5" width="1" height="1" />
            <rect x="4" y="5" width="1" height="1" />
            <rect x="5" y="5" width="1" height="1" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="7" y="5" width="1" height="1" />
            <rect x="0" y="6" width="1" height="1" />
            <rect x="1" y="6" width="1" height="1" />
            <rect x="2" y="6" width="1" height="1" />
            <rect x="3" y="6" width="1" height="1" />
            <rect x="4" y="6" width="1" height="1" />
            <rect x="5" y="6" width="1" height="1" />
            <rect x="6" y="6" width="1" height="1" />
            <rect x="7" y="6" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-sheen"
          style={
            {
              position: 'absolute',
              inset: '0',
              borderRadius: '10px',
              overflow: 'hidden',
              pointerEvents: 'none',
              '--sh': 'rgba(255,220,160,.32)',
              '--shd': '4s',
            } as CSSProperties
          }
        ></div>
      </div>
    </>
  );
}

/** Holo animé, ciel étoilé, trophée, lauriers. */
export function HofBack() {
  return (
    <>
      <div
        className="c-card"
        style={{
          position: 'relative',
          width: '240px',
          height: '336px',
          filter:
            'drop-shadow(3px 3px 0 rgba(0,0,0,.5)) drop-shadow(0 0 30px rgba(79,227,209,.5)) drop-shadow(0 20px 26px rgba(0,0,0,.5))',
        }}
      >
        <div
          className="c-holo"
          style={{
            position: 'absolute',
            inset: '0',
            borderRadius: '14px',
            background: 'conic-gradient(from 200deg,#2EE6FF,#A05CFF,#FF4FB0,#FFD23F,#2EE6FF)',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            inset: '5px',
            borderRadius: '10px',
            overflow: 'hidden',
            background: 'radial-gradient(ellipse 70% 50% at 50% 45%,#3B2F7A,#120E2A 60%,#0B0818)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '173px',
              top: '144px',
              width: '3px',
              height: '2px',
              background: '#fff',
              opacity: '0.8',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '203px',
              top: '285px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.3',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '180px',
              top: '40px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '134px',
              top: '140px',
              width: '2px',
              height: '3px',
              background: '#fff',
              opacity: '0.3',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '160px',
              top: '141px',
              width: '2px',
              height: '3px',
              background: '#fff',
              opacity: '0.3',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '118px',
              top: '157px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.3',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '209px',
              top: '50px',
              width: '2px',
              height: '3px',
              background: '#fff',
              opacity: '0.8',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '127px',
              top: '78px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.3',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '67px',
              top: '124px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '94px',
              top: '115px',
              width: '3px',
              height: '3px',
              background: '#fff',
              opacity: '0.8',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '66px',
              top: '107px',
              width: '3px',
              height: '2px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '90px',
              top: '25px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.3',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '51px',
              top: '149px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '168px',
              top: '314px',
              width: '2px',
              height: '3px',
              background: '#fff',
              opacity: '0.8',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '195px',
              top: '187px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '92px',
              top: '260px',
              width: '3px',
              height: '2px',
              background: '#fff',
              opacity: '0.3',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '137px',
              top: '255px',
              width: '3px',
              height: '2px',
              background: '#fff',
              opacity: '0.3',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '79px',
              top: '25px',
              width: '3px',
              height: '2px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '18px',
              top: '295px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '162px',
              top: '18px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.8',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '60px',
              top: '114px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '102px',
              top: '276px',
              width: '2px',
              height: '3px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '212px',
              top: '250px',
              width: '2px',
              height: '3px',
              background: '#fff',
              opacity: '0.8',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '213px',
              top: '202px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '37px',
              top: '120px',
              width: '2px',
              height: '3px',
              background: '#fff',
              opacity: '0.8',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '106px',
              top: '89px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.8',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '153px',
              top: '61px',
              width: '2px',
              height: '3px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '92px',
              top: '104px',
              width: '2px',
              height: '3px',
              background: '#fff',
              opacity: '0.3',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '198px',
              top: '172px',
              width: '2px',
              height: '2px',
              background: '#fff',
              opacity: '0.8',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              left: '26px',
              top: '55px',
              width: '3px',
              height: '3px',
              background: '#fff',
              opacity: '0.5',
            }}
          ></div>
          <div
            className="c-foil"
            style={{
              position: 'absolute',
              inset: '0',
              mixBlendMode: 'color-dodge',
              opacity: '.45',
              background:
                'linear-gradient(115deg,rgba(46,230,255,0) 20%,rgba(46,230,255,.6) 35%,rgba(255,79,176,.6) 50%,rgba(255,210,63,.6) 65%,rgba(255,210,63,0) 80%)',
              backgroundSize: '250% 250%',
            }}
          ></div>
          <div
            className="c-spark"
            style={{ position: 'absolute', left: '30px', top: '50px', animationDelay: '0s' }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 5 5"
              fill="#fff"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" />
              <rect x="2" y="1" width="1" height="1" />
              <rect x="0" y="2" width="1" height="1" />
              <rect x="1" y="2" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="2" width="1" height="1" />
              <rect x="2" y="3" width="1" height="1" />
              <rect x="2" y="4" width="1" height="1" />
            </svg>
          </div>
          <div
            className="c-spark"
            style={{ position: 'absolute', left: '190px', top: '40px', animationDelay: '0.7s' }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 5 5"
              fill="#fff"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" />
              <rect x="2" y="1" width="1" height="1" />
              <rect x="0" y="2" width="1" height="1" />
              <rect x="1" y="2" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="2" width="1" height="1" />
              <rect x="2" y="3" width="1" height="1" />
              <rect x="2" y="4" width="1" height="1" />
            </svg>
          </div>
          <div
            className="c-spark"
            style={{ position: 'absolute', left: '200px', top: '250px', animationDelay: '1.3s' }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 5 5"
              fill="#fff"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" />
              <rect x="2" y="1" width="1" height="1" />
              <rect x="0" y="2" width="1" height="1" />
              <rect x="1" y="2" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="2" width="1" height="1" />
              <rect x="2" y="3" width="1" height="1" />
              <rect x="2" y="4" width="1" height="1" />
            </svg>
          </div>
          <div
            className="c-spark"
            style={{ position: 'absolute', left: '36px', top: '270px', animationDelay: '1.9s' }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 5 5"
              fill="#fff"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" />
              <rect x="2" y="1" width="1" height="1" />
              <rect x="0" y="2" width="1" height="1" />
              <rect x="1" y="2" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="2" width="1" height="1" />
              <rect x="2" y="3" width="1" height="1" />
              <rect x="2" y="4" width="1" height="1" />
            </svg>
          </div>
          <div
            className="c-spark"
            style={{ position: 'absolute', left: '120px', top: '24px', animationDelay: '0.4s' }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 5 5"
              fill="#fff"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" />
              <rect x="2" y="1" width="1" height="1" />
              <rect x="0" y="2" width="1" height="1" />
              <rect x="1" y="2" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="2" width="1" height="1" />
              <rect x="2" y="3" width="1" height="1" />
              <rect x="2" y="4" width="1" height="1" />
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              inset: '9px',
              border: '1px solid rgba(255,210,63,.5)',
              borderRadius: '7px',
            }}
          ></div>
          <div
            style={{ position: 'relative', filter: 'drop-shadow(0 0 10px rgba(255,210,63,.8))' }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 8 8"
              fill="#FFD23F"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="0" y="0" width="1" height="1" />
              <rect x="1" y="0" width="1" height="1" />
              <rect x="2" y="0" width="1" height="1" />
              <rect x="3" y="0" width="1" height="1" />
              <rect x="4" y="0" width="1" height="1" />
              <rect x="5" y="0" width="1" height="1" />
              <rect x="6" y="0" width="1" height="1" />
              <rect x="7" y="0" width="1" height="1" />
              <rect x="1" y="1" width="1" height="1" />
              <rect x="2" y="1" width="1" height="1" />
              <rect x="3" y="1" width="1" height="1" />
              <rect x="4" y="1" width="1" height="1" />
              <rect x="5" y="1" width="1" height="1" />
              <rect x="6" y="1" width="1" height="1" />
              <rect x="0" y="2" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="2" width="1" height="1" />
              <rect x="5" y="2" width="1" height="1" />
              <rect x="7" y="2" width="1" height="1" />
              <rect x="0" y="3" width="1" height="1" />
              <rect x="2" y="3" width="1" height="1" />
              <rect x="3" y="3" width="1" height="1" />
              <rect x="4" y="3" width="1" height="1" />
              <rect x="5" y="3" width="1" height="1" />
              <rect x="7" y="3" width="1" height="1" />
              <rect x="1" y="4" width="1" height="1" />
              <rect x="2" y="4" width="1" height="1" />
              <rect x="3" y="4" width="1" height="1" />
              <rect x="4" y="4" width="1" height="1" />
              <rect x="5" y="4" width="1" height="1" />
              <rect x="6" y="4" width="1" height="1" />
              <rect x="3" y="5" width="1" height="1" />
              <rect x="4" y="5" width="1" height="1" />
              <rect x="2" y="6" width="1" height="1" />
              <rect x="3" y="6" width="1" height="1" />
              <rect x="4" y="6" width="1" height="1" />
              <rect x="5" y="6" width="1" height="1" />
              <rect x="1" y="7" width="1" height="1" />
              <rect x="2" y="7" width="1" height="1" />
              <rect x="3" y="7" width="1" height="1" />
              <rect x="4" y="7" width="1" height="1" />
              <rect x="5" y="7" width="1" height="1" />
              <rect x="6" y="7" width="1" height="1" />
            </svg>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg
              width="16"
              height="36"
              viewBox="0 0 4 9"
              fill="#FFD23F"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="1" y="0" width="1" height="1" />
              <rect x="1" y="1" width="1" height="1" />
              <rect x="2" y="1" width="1" height="1" />
              <rect x="0" y="2" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="0" y="3" width="1" height="1" />
              <rect x="1" y="3" width="1" height="1" />
              <rect x="0" y="4" width="1" height="1" />
              <rect x="2" y="4" width="1" height="1" />
              <rect x="0" y="5" width="1" height="1" />
              <rect x="1" y="5" width="1" height="1" />
              <rect x="0" y="6" width="1" height="1" />
              <rect x="2" y="6" width="1" height="1" />
              <rect x="1" y="7" width="1" height="1" />
              <rect x="2" y="7" width="1" height="1" />
              <rect x="2" y="8" width="1" height="1" />
              <rect x="3" y="8" width="1" height="1" />
            </svg>
            <svg
              width="61"
              height="66"
              viewBox="0 0 12 13"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" fill="#FFF1C2" />
              <rect x="3" y="0" width="1" height="1" fill="#FFF1C2" />
              <rect x="4" y="0" width="1" height="1" fill="#FFF1C2" />
              <rect x="5" y="0" width="1" height="1" fill="#FFF1C2" />
              <rect x="6" y="0" width="1" height="1" fill="#FFF1C2" />
              <rect x="7" y="0" width="1" height="1" fill="#FFF1C2" />
              <rect x="8" y="0" width="1" height="1" fill="#FFF1C2" />
              <rect x="9" y="0" width="1" height="1" fill="#FFF1C2" />
              <rect x="1" y="1" width="1" height="1" fill="#FFF1C2" />
              <rect x="10" y="1" width="1" height="1" fill="#FFF1C2" />
              <rect x="0" y="2" width="1" height="1" fill="#FFF1C2" />
              <rect x="11" y="2" width="1" height="1" fill="#FFF1C2" />
              <rect x="0" y="3" width="1" height="1" fill="#FFF1C2" />
              <rect x="5" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="3" width="1" height="1" fill="#FFF1C2" />
              <rect x="0" y="4" width="1" height="1" fill="#FFF1C2" />
              <rect x="4" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="4" width="1" height="1" fill="#FFF1C2" />
              <rect x="0" y="5" width="1" height="1" fill="#FFF1C2" />
              <rect x="3" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="5" width="1" height="1" fill="#FFF1C2" />
              <rect x="0" y="6" width="1" height="1" fill="#FFF1C2" />
              <rect x="3" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="6" width="1" height="1" fill="#FFF1C2" />
              <rect x="0" y="7" width="1" height="1" fill="#FFF1C2" />
              <rect x="4" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="7" width="1" height="1" fill="#FFF1C2" />
              <rect x="0" y="8" width="1" height="1" fill="#FFF1C2" />
              <rect x="5" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="8" width="1" height="1" fill="#FFF1C2" />
              <rect x="0" y="9" width="1" height="1" fill="#FFF1C2" />
              <rect x="11" y="9" width="1" height="1" fill="#FFF1C2" />
              <rect x="0" y="10" width="1" height="1" fill="#FFF1C2" />
              <rect x="11" y="10" width="1" height="1" fill="#FFF1C2" />
              <rect x="1" y="11" width="1" height="1" fill="#FFF1C2" />
              <rect x="10" y="11" width="1" height="1" fill="#FFF1C2" />
              <rect x="2" y="12" width="1" height="1" fill="#FFF1C2" />
              <rect x="3" y="12" width="1" height="1" fill="#FFF1C2" />
              <rect x="4" y="12" width="1" height="1" fill="#FFF1C2" />
              <rect x="5" y="12" width="1" height="1" fill="#FFF1C2" />
              <rect x="6" y="12" width="1" height="1" fill="#FFF1C2" />
              <rect x="7" y="12" width="1" height="1" fill="#FFF1C2" />
              <rect x="8" y="12" width="1" height="1" fill="#FFF1C2" />
              <rect x="9" y="12" width="1" height="1" fill="#FFF1C2" />
            </svg>
            <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>
              <svg
                width="16"
                height="36"
                viewBox="0 0 4 9"
                fill="#FFD23F"
                shapeRendering="crispEdges"
                aria-hidden="true"
              >
                <rect x="1" y="0" width="1" height="1" />
                <rect x="1" y="1" width="1" height="1" />
                <rect x="2" y="1" width="1" height="1" />
                <rect x="0" y="2" width="1" height="1" />
                <rect x="2" y="2" width="1" height="1" />
                <rect x="0" y="3" width="1" height="1" />
                <rect x="1" y="3" width="1" height="1" />
                <rect x="0" y="4" width="1" height="1" />
                <rect x="2" y="4" width="1" height="1" />
                <rect x="0" y="5" width="1" height="1" />
                <rect x="1" y="5" width="1" height="1" />
                <rect x="0" y="6" width="1" height="1" />
                <rect x="2" y="6" width="1" height="1" />
                <rect x="1" y="7" width="1" height="1" />
                <rect x="2" y="7" width="1" height="1" />
                <rect x="2" y="8" width="1" height="1" />
                <rect x="3" y="8" width="1" height="1" />
              </svg>
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                fontFamily: 'Silkscreen,monospace',
                fontSize: '18px',
                letterSpacing: '1px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#4FE3D1' }}>PIX</span>
              <span style={{ color: '#EADFC8' }}>PEDIA</span>
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              background: 'rgba(18,14,26,.85)',
              border: '1px solid #FFD23F',
              borderRadius: '4px',
              padding: '3px 10px',
              fontFamily: 'Silkscreen,monospace',
              fontSize: '9px',
              letterSpacing: '1px',
              color: '#FFD23F',
            }}
          >
            ÉDITION HALL OF FAME
          </div>
        </div>
        <div
          className="c-sheen"
          style={
            {
              position: 'absolute',
              inset: '0',
              borderRadius: '14px',
              overflow: 'hidden',
              pointerEvents: 'none',
              '--sh': 'rgba(255,255,255,.45)',
              '--shd': '3s',
            } as CSSProperties
          }
        ></div>
      </div>
    </>
  );
}

/** Dos standard sous une feuille holo. */
export function HoloBack() {
  return (
    <>
      <div
        className="c-card"
        style={{
          position: 'relative',
          width: '240px',
          height: '336px',
          filter:
            'drop-shadow(3px 3px 0 rgba(0,0,0,.5)) drop-shadow(0 0 22px rgba(160,92,255,.4)) drop-shadow(0 20px 26px rgba(0,0,0,.5))',
        }}
      >
        <div
          className="c-holo"
          style={{
            position: 'absolute',
            inset: '0',
            borderRadius: '14px',
            background: 'conic-gradient(from 200deg,#2EE6FF,#A05CFF,#FF4FB0,#FFD23F,#2EE6FF)',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '11px',
            overflow: 'hidden',
            background: '#1E1828',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0',
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          ></div>
          <div
            className="c-foil"
            style={{
              position: 'absolute',
              inset: '0',
              mixBlendMode: 'color-dodge',
              opacity: '.6',
              background:
                'linear-gradient(115deg,rgba(46,230,255,0) 15%,rgba(46,230,255,.55) 30%,rgba(160,92,255,.5) 42%,rgba(255,79,176,.55) 54%,rgba(255,210,63,.55) 66%,rgba(255,210,63,0) 80%)',
              backgroundSize: '260% 260%',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              inset: '0',
              mixBlendMode: 'overlay',
              opacity: '.3',
              background:
                'repeating-linear-gradient(135deg,transparent 0 6px,rgba(255,255,255,.4) 6px 7px)',
            }}
          ></div>
          <div style={{ position: 'relative' }}>
            <svg
              width="89"
              height="96"
              viewBox="0 0 12 13"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" fill="#FFFFFF" />
              <rect x="3" y="0" width="1" height="1" fill="#FFFFFF" />
              <rect x="4" y="0" width="1" height="1" fill="#FFFFFF" />
              <rect x="5" y="0" width="1" height="1" fill="#FFFFFF" />
              <rect x="6" y="0" width="1" height="1" fill="#FFFFFF" />
              <rect x="7" y="0" width="1" height="1" fill="#FFFFFF" />
              <rect x="8" y="0" width="1" height="1" fill="#FFFFFF" />
              <rect x="9" y="0" width="1" height="1" fill="#FFFFFF" />
              <rect x="1" y="1" width="1" height="1" fill="#FFFFFF" />
              <rect x="10" y="1" width="1" height="1" fill="#FFFFFF" />
              <rect x="0" y="2" width="1" height="1" fill="#FFFFFF" />
              <rect x="11" y="2" width="1" height="1" fill="#FFFFFF" />
              <rect x="0" y="3" width="1" height="1" fill="#FFFFFF" />
              <rect x="5" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="3" width="1" height="1" fill="#FFFFFF" />
              <rect x="0" y="4" width="1" height="1" fill="#FFFFFF" />
              <rect x="4" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="4" width="1" height="1" fill="#FFFFFF" />
              <rect x="0" y="5" width="1" height="1" fill="#FFFFFF" />
              <rect x="3" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="5" width="1" height="1" fill="#FFFFFF" />
              <rect x="0" y="6" width="1" height="1" fill="#FFFFFF" />
              <rect x="3" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="6" width="1" height="1" fill="#FFFFFF" />
              <rect x="0" y="7" width="1" height="1" fill="#FFFFFF" />
              <rect x="4" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="7" width="1" height="1" fill="#FFFFFF" />
              <rect x="0" y="8" width="1" height="1" fill="#FFFFFF" />
              <rect x="5" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="8" width="1" height="1" fill="#FFFFFF" />
              <rect x="0" y="9" width="1" height="1" fill="#FFFFFF" />
              <rect x="11" y="9" width="1" height="1" fill="#FFFFFF" />
              <rect x="0" y="10" width="1" height="1" fill="#FFFFFF" />
              <rect x="11" y="10" width="1" height="1" fill="#FFFFFF" />
              <rect x="1" y="11" width="1" height="1" fill="#FFFFFF" />
              <rect x="10" y="11" width="1" height="1" fill="#FFFFFF" />
              <rect x="2" y="12" width="1" height="1" fill="#FFFFFF" />
              <rect x="3" y="12" width="1" height="1" fill="#FFFFFF" />
              <rect x="4" y="12" width="1" height="1" fill="#FFFFFF" />
              <rect x="5" y="12" width="1" height="1" fill="#FFFFFF" />
              <rect x="6" y="12" width="1" height="1" fill="#FFFFFF" />
              <rect x="7" y="12" width="1" height="1" fill="#FFFFFF" />
              <rect x="8" y="12" width="1" height="1" fill="#FFFFFF" />
              <rect x="9" y="12" width="1" height="1" fill="#FFFFFF" />
            </svg>
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                fontFamily: 'Silkscreen,monospace',
                fontSize: '22px',
                letterSpacing: '1px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#4FE3D1' }}>PIX</span>
              <span style={{ color: '#EADFC8' }}>PEDIA</span>
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              fontFamily: 'Silkscreen,monospace',
              fontSize: '9px',
              letterSpacing: '3px',
              color: '#fff',
            }}
          >
            FINITION HOLO
          </div>
        </div>
        <div
          className="c-spark"
          style={{
            position: 'absolute',
            left: '30px',
            top: '50px',
            zIndex: '8',
            animationDelay: '0s',
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 5 5"
            fill="#fff"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="2" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="0" y="2" width="1" height="1" />
            <rect x="1" y="2" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-spark"
          style={{
            position: 'absolute',
            left: '190px',
            top: '70px',
            zIndex: '8',
            animationDelay: '0.9s',
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 5 5"
            fill="#fff"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="2" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="0" y="2" width="1" height="1" />
            <rect x="1" y="2" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-spark"
          style={{
            position: 'absolute',
            left: '200px',
            top: '260px',
            zIndex: '8',
            animationDelay: '1.6s',
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 5 5"
            fill="#fff"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="2" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="0" y="2" width="1" height="1" />
            <rect x="1" y="2" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-spark"
          style={{
            position: 'absolute',
            left: '40px',
            top: '280px',
            zIndex: '8',
            animationDelay: '2.2s',
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 5 5"
            fill="#fff"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="2" y="0" width="1" height="1" />
            <rect x="2" y="1" width="1" height="1" />
            <rect x="0" y="2" width="1" height="1" />
            <rect x="1" y="2" width="1" height="1" />
            <rect x="2" y="2" width="1" height="1" />
            <rect x="3" y="2" width="1" height="1" />
            <rect x="4" y="2" width="1" height="1" />
            <rect x="2" y="3" width="1" height="1" />
            <rect x="2" y="4" width="1" height="1" />
          </svg>
        </div>
        <div
          className="c-sheen"
          style={
            {
              position: 'absolute',
              inset: '0',
              borderRadius: '14px',
              overflow: 'hidden',
              pointerEvents: 'none',
              '--sh': 'rgba(255,255,255,.4)',
              '--shd': '3.5s',
            } as CSSProperties
          }
        ></div>
      </div>
    </>
  );
}

/** Paysage pixel pleine carte, logo au centre. */
export function FullArtBack() {
  return (
    <>
      <div
        className="c-card"
        style={{
          position: 'relative',
          width: '240px',
          height: '336px',
          filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,.5)) drop-shadow(0 20px 26px rgba(0,0,0,.5))',
        }}
      >
        <div
          style={{ position: 'absolute', inset: '0', borderRadius: '12px', background: '#EADFC8' }}
        ></div>
        <div
          style={{ position: 'absolute', inset: '3px', borderRadius: '10px', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', inset: '0' }}>
            <svg
              viewBox="0 0 60 30"
              preserveAspectRatio="none"
              shapeRendering="crispEdges"
              style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="g77" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2D5BB8" />
                  <stop offset="1" stopColor="#1A1030" />
                </linearGradient>
              </defs>
              <rect width="60" height="30" fill="url(#g77)" />
              <rect x="16" y="8" width="1" height="1" fill="#fff" opacity="0.8" />
              <rect x="44" y="7" width="1" height="1" fill="#fff" opacity="0.3" />
              <rect x="41" y="7" width="1" height="1" fill="#fff" opacity="0.8" />
              <rect x="41" y="1" width="1" height="1" fill="#fff" opacity="0.3" />
              <rect x="19" y="8" width="1" height="1" fill="#fff" opacity="0.3" />
              <rect x="1" y="7" width="1" height="1" fill="#fff" opacity="0.5" />
              <rect x="59" y="6" width="1" height="1" fill="#fff" opacity="0.8" />
              <rect x="0" y="0" width="1" height="1" fill="#fff" opacity="0.5" />
              <rect x="9" y="0" width="1" height="1" fill="#fff" opacity="0.8" />
              <rect x="0" y="3" width="1" height="1" fill="#fff" opacity="0.3" />
              <rect x="42" y="7" width="1" height="1" fill="#fff" opacity="0.3" />
              <rect x="55" y="6" width="1" height="1" fill="#fff" opacity="0.5" />
              <rect x="6" y="2" width="1" height="1" fill="#fff" opacity="0.3" />
              <rect x="16" y="3" width="1" height="1" fill="#fff" opacity="0.3" />
              <rect x="42" y="5" width="6" height="6" fill="#FFD23F" />
              <rect x="41" y="6" width="8" height="4" fill="#FFD23F" />
              <g fill="#0B0818" opacity=".55">
                <rect x="0" y="12" width="1" height="18" />
                <rect x="1" y="12" width="1" height="18" />
                <rect x="2" y="12" width="1" height="18" />
                <rect x="3" y="12" width="1" height="18" />
                <rect x="4" y="12" width="1" height="18" />
                <rect x="5" y="13" width="1" height="17" />
                <rect x="6" y="13" width="1" height="17" />
                <rect x="7" y="12" width="1" height="18" />
                <rect x="8" y="12" width="1" height="18" />
                <rect x="9" y="12" width="1" height="18" />
                <rect x="10" y="13" width="1" height="17" />
                <rect x="11" y="13" width="1" height="17" />
                <rect x="12" y="14" width="1" height="16" />
                <rect x="13" y="13" width="1" height="17" />
                <rect x="14" y="13" width="1" height="17" />
                <rect x="15" y="13" width="1" height="17" />
                <rect x="16" y="12" width="1" height="18" />
                <rect x="17" y="12" width="1" height="18" />
                <rect x="18" y="12" width="1" height="18" />
                <rect x="19" y="12" width="1" height="18" />
                <rect x="20" y="13" width="1" height="17" />
                <rect x="21" y="14" width="1" height="16" />
                <rect x="22" y="14" width="1" height="16" />
                <rect x="23" y="13" width="1" height="17" />
                <rect x="24" y="13" width="1" height="17" />
                <rect x="25" y="13" width="1" height="17" />
                <rect x="26" y="13" width="1" height="17" />
                <rect x="27" y="14" width="1" height="16" />
                <rect x="28" y="15" width="1" height="15" />
                <rect x="29" y="15" width="1" height="15" />
                <rect x="30" y="14" width="1" height="16" />
                <rect x="31" y="15" width="1" height="15" />
                <rect x="32" y="16" width="1" height="14" />
                <rect x="33" y="16" width="1" height="14" />
                <rect x="34" y="16" width="1" height="14" />
                <rect x="35" y="17" width="1" height="13" />
                <rect x="36" y="18" width="1" height="12" />
                <rect x="37" y="17" width="1" height="13" />
                <rect x="38" y="18" width="1" height="12" />
                <rect x="39" y="19" width="1" height="11" />
                <rect x="40" y="19" width="1" height="11" />
                <rect x="41" y="18" width="1" height="12" />
                <rect x="42" y="19" width="1" height="11" />
                <rect x="43" y="19" width="1" height="11" />
                <rect x="44" y="20" width="1" height="10" />
                <rect x="45" y="19" width="1" height="11" />
                <rect x="46" y="19" width="1" height="11" />
                <rect x="47" y="19" width="1" height="11" />
                <rect x="48" y="18" width="1" height="12" />
                <rect x="49" y="17" width="1" height="13" />
                <rect x="50" y="17" width="1" height="13" />
                <rect x="51" y="16" width="1" height="14" />
                <rect x="52" y="17" width="1" height="13" />
                <rect x="53" y="18" width="1" height="12" />
                <rect x="54" y="19" width="1" height="11" />
                <rect x="55" y="18" width="1" height="12" />
                <rect x="56" y="19" width="1" height="11" />
                <rect x="57" y="19" width="1" height="11" />
                <rect x="58" y="18" width="1" height="12" />
                <rect x="59" y="19" width="1" height="11" />
              </g>
              <g fill="#0B0818">
                <rect x="0" y="26" width="1" height="4" />
                <rect x="1" y="26" width="1" height="4" />
                <rect x="2" y="26" width="1" height="4" />
                <rect x="3" y="26" width="1" height="4" />
                <rect x="4" y="26" width="1" height="4" />
                <rect x="5" y="26" width="1" height="4" />
                <rect x="6" y="26" width="1" height="4" />
                <rect x="7" y="26" width="1" height="4" />
                <rect x="8" y="25" width="1" height="5" />
                <rect x="9" y="26" width="1" height="4" />
                <rect x="10" y="26" width="1" height="4" />
                <rect x="11" y="26" width="1" height="4" />
                <rect x="12" y="26" width="1" height="4" />
                <rect x="13" y="26" width="1" height="4" />
                <rect x="14" y="26" width="1" height="4" />
                <rect x="15" y="26" width="1" height="4" />
                <rect x="16" y="26" width="1" height="4" />
                <rect x="17" y="26" width="1" height="4" />
                <rect x="18" y="26" width="1" height="4" />
                <rect x="19" y="26" width="1" height="4" />
                <rect x="20" y="26" width="1" height="4" />
                <rect x="21" y="26" width="1" height="4" />
                <rect x="22" y="26" width="1" height="4" />
                <rect x="23" y="26" width="1" height="4" />
                <rect x="24" y="26" width="1" height="4" />
                <rect x="25" y="25" width="1" height="5" />
                <rect x="26" y="25" width="1" height="5" />
                <rect x="27" y="25" width="1" height="5" />
                <rect x="28" y="24" width="1" height="6" />
                <rect x="29" y="23" width="1" height="7" />
                <rect x="30" y="24" width="1" height="6" />
                <rect x="31" y="24" width="1" height="6" />
                <rect x="32" y="23" width="1" height="7" />
                <rect x="33" y="22" width="1" height="8" />
                <rect x="34" y="22" width="1" height="8" />
                <rect x="35" y="22" width="1" height="8" />
                <rect x="36" y="22" width="1" height="8" />
                <rect x="37" y="23" width="1" height="7" />
                <rect x="38" y="23" width="1" height="7" />
                <rect x="39" y="22" width="1" height="8" />
                <rect x="40" y="21" width="1" height="9" />
                <rect x="41" y="21" width="1" height="9" />
                <rect x="42" y="21" width="1" height="9" />
                <rect x="43" y="21" width="1" height="9" />
                <rect x="44" y="22" width="1" height="8" />
                <rect x="45" y="22" width="1" height="8" />
                <rect x="46" y="22" width="1" height="8" />
                <rect x="47" y="23" width="1" height="7" />
                <rect x="48" y="22" width="1" height="8" />
                <rect x="49" y="22" width="1" height="8" />
                <rect x="50" y="21" width="1" height="9" />
                <rect x="51" y="21" width="1" height="9" />
                <rect x="52" y="21" width="1" height="9" />
                <rect x="53" y="22" width="1" height="8" />
                <rect x="54" y="22" width="1" height="8" />
                <rect x="55" y="21" width="1" height="9" />
                <rect x="56" y="21" width="1" height="9" />
                <rect x="57" y="21" width="1" height="9" />
                <rect x="58" y="21" width="1" height="9" />
                <rect x="59" y="21" width="1" height="9" />
              </g>
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              inset: '0',
              background:
                'radial-gradient(ellipse 70% 50% at 50% 45%,rgba(18,14,26,.25),rgba(18,14,26,.8))',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              inset: '0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <div style={{ filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,.6))' }}>
              <svg
                width="89"
                height="96"
                viewBox="0 0 12 13"
                shapeRendering="crispEdges"
                aria-hidden="true"
              >
                <rect x="2" y="0" width="1" height="1" fill="#EADFC8" />
                <rect x="3" y="0" width="1" height="1" fill="#EADFC8" />
                <rect x="4" y="0" width="1" height="1" fill="#EADFC8" />
                <rect x="5" y="0" width="1" height="1" fill="#EADFC8" />
                <rect x="6" y="0" width="1" height="1" fill="#EADFC8" />
                <rect x="7" y="0" width="1" height="1" fill="#EADFC8" />
                <rect x="8" y="0" width="1" height="1" fill="#EADFC8" />
                <rect x="9" y="0" width="1" height="1" fill="#EADFC8" />
                <rect x="1" y="1" width="1" height="1" fill="#EADFC8" />
                <rect x="10" y="1" width="1" height="1" fill="#EADFC8" />
                <rect x="0" y="2" width="1" height="1" fill="#EADFC8" />
                <rect x="11" y="2" width="1" height="1" fill="#EADFC8" />
                <rect x="0" y="3" width="1" height="1" fill="#EADFC8" />
                <rect x="5" y="3" width="1" height="1" fill="#4FE3D1" />
                <rect x="6" y="3" width="1" height="1" fill="#4FE3D1" />
                <rect x="11" y="3" width="1" height="1" fill="#EADFC8" />
                <rect x="0" y="4" width="1" height="1" fill="#EADFC8" />
                <rect x="4" y="4" width="1" height="1" fill="#4FE3D1" />
                <rect x="5" y="4" width="1" height="1" fill="#4FE3D1" />
                <rect x="6" y="4" width="1" height="1" fill="#4FE3D1" />
                <rect x="7" y="4" width="1" height="1" fill="#4FE3D1" />
                <rect x="11" y="4" width="1" height="1" fill="#EADFC8" />
                <rect x="0" y="5" width="1" height="1" fill="#EADFC8" />
                <rect x="3" y="5" width="1" height="1" fill="#4FE3D1" />
                <rect x="4" y="5" width="1" height="1" fill="#4FE3D1" />
                <rect x="5" y="5" width="1" height="1" fill="#4FE3D1" />
                <rect x="6" y="5" width="1" height="1" fill="#4FE3D1" />
                <rect x="7" y="5" width="1" height="1" fill="#4FE3D1" />
                <rect x="8" y="5" width="1" height="1" fill="#4FE3D1" />
                <rect x="11" y="5" width="1" height="1" fill="#EADFC8" />
                <rect x="0" y="6" width="1" height="1" fill="#EADFC8" />
                <rect x="3" y="6" width="1" height="1" fill="#4FE3D1" />
                <rect x="4" y="6" width="1" height="1" fill="#4FE3D1" />
                <rect x="5" y="6" width="1" height="1" fill="#4FE3D1" />
                <rect x="6" y="6" width="1" height="1" fill="#4FE3D1" />
                <rect x="7" y="6" width="1" height="1" fill="#4FE3D1" />
                <rect x="8" y="6" width="1" height="1" fill="#4FE3D1" />
                <rect x="11" y="6" width="1" height="1" fill="#EADFC8" />
                <rect x="0" y="7" width="1" height="1" fill="#EADFC8" />
                <rect x="4" y="7" width="1" height="1" fill="#4FE3D1" />
                <rect x="5" y="7" width="1" height="1" fill="#4FE3D1" />
                <rect x="6" y="7" width="1" height="1" fill="#4FE3D1" />
                <rect x="7" y="7" width="1" height="1" fill="#4FE3D1" />
                <rect x="11" y="7" width="1" height="1" fill="#EADFC8" />
                <rect x="0" y="8" width="1" height="1" fill="#EADFC8" />
                <rect x="5" y="8" width="1" height="1" fill="#4FE3D1" />
                <rect x="6" y="8" width="1" height="1" fill="#4FE3D1" />
                <rect x="11" y="8" width="1" height="1" fill="#EADFC8" />
                <rect x="0" y="9" width="1" height="1" fill="#EADFC8" />
                <rect x="11" y="9" width="1" height="1" fill="#EADFC8" />
                <rect x="0" y="10" width="1" height="1" fill="#EADFC8" />
                <rect x="11" y="10" width="1" height="1" fill="#EADFC8" />
                <rect x="1" y="11" width="1" height="1" fill="#EADFC8" />
                <rect x="10" y="11" width="1" height="1" fill="#EADFC8" />
                <rect x="2" y="12" width="1" height="1" fill="#EADFC8" />
                <rect x="3" y="12" width="1" height="1" fill="#EADFC8" />
                <rect x="4" y="12" width="1" height="1" fill="#EADFC8" />
                <rect x="5" y="12" width="1" height="1" fill="#EADFC8" />
                <rect x="6" y="12" width="1" height="1" fill="#EADFC8" />
                <rect x="7" y="12" width="1" height="1" fill="#EADFC8" />
                <rect x="8" y="12" width="1" height="1" fill="#EADFC8" />
                <rect x="9" y="12" width="1" height="1" fill="#EADFC8" />
              </svg>
            </div>
            <div>
              <span
                style={{
                  fontFamily: 'Silkscreen,monospace',
                  fontSize: '22px',
                  letterSpacing: '1px',
                  lineHeight: '1',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: '#4FE3D1' }}>PIX</span>
                <span style={{ color: '#EADFC8' }}>PEDIA</span>
              </span>
            </div>
            <div
              style={{
                fontFamily: 'Silkscreen,monospace',
                fontSize: '9px',
                letterSpacing: '3px',
                color: '#EADFC8',
              }}
            >
              FINITION FULL ART
            </div>
          </div>
        </div>
        <div
          className="c-sheen"
          style={
            {
              position: 'absolute',
              inset: '0',
              borderRadius: '12px',
              overflow: 'hidden',
              pointerEvents: 'none',
              '--sh': 'rgba(255,255,255,.22)',
              '--shd': '4.5s',
            } as CSSProperties
          }
        ></div>
      </div>
    </>
  );
}

/** Scène de nuit, projecteurs, LED, nom de l'événement. */
export function ArenaBack({ eventName = 'Événement' }: { eventName?: string }) {
  return (
    <>
      <div
        className="c-card"
        style={{
          position: 'relative',
          width: '240px',
          height: '336px',
          filter:
            'drop-shadow(3px 3px 0 rgba(0,0,0,.5)) drop-shadow(0 0 18px rgba(255,79,176,.45)) drop-shadow(0 20px 26px rgba(0,0,0,.5))',
        }}
      >
        <div
          className="ar-neon"
          style={{
            position: 'absolute',
            inset: '0',
            borderRadius: '10px',
            background: 'linear-gradient(135deg,#FF4FB0,#A05CFF 50%,#2EE6FF)',
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            inset: '4px',
            borderRadius: '7px',
            overflow: 'hidden',
            background:
              'radial-gradient(ellipse 80% 45% at 50% 100%,rgba(160,92,255,.45),transparent 70%),#0B0714',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          <div
            className="ar-beam"
            style={{
              position: 'absolute',
              left: '30px',
              top: '-30px',
              width: '50px',
              height: '380px',
              background: 'linear-gradient(180deg,rgba(46,230,255,.35),transparent)',
              transformOrigin: 'top center',
              transform: 'rotate(16deg)',
            }}
          ></div>
          <div
            className="ar-beam2"
            style={{
              position: 'absolute',
              right: '30px',
              top: '-30px',
              width: '50px',
              height: '380px',
              background: 'linear-gradient(180deg,rgba(255,79,176,.35),transparent)',
              transformOrigin: 'top center',
              transform: 'rotate(-16deg)',
            }}
          ></div>
          <div style={{ position: 'relative', display: 'flex', gap: '6px' }}>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#FF4FB0',
                animationDelay: '0.0s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#2EE6FF',
                animationDelay: '0.1s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#FF4FB0',
                animationDelay: '0.2s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#2EE6FF',
                animationDelay: '0.3s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#FF4FB0',
                animationDelay: '0.4s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#2EE6FF',
                animationDelay: '0.5s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#FF4FB0',
                animationDelay: '0.6s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#2EE6FF',
                animationDelay: '0.7s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#FF4FB0',
                animationDelay: '0.8s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#2EE6FF',
                animationDelay: '0.9s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#FF4FB0',
                animationDelay: '1.0s',
              }}
            ></div>
            <div
              className="ar-led"
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#2EE6FF',
                animationDelay: '1.1s',
              }}
            ></div>
          </div>
          <div style={{ position: 'relative' }}>
            <svg
              width="83"
              height="90"
              viewBox="0 0 12 13"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="3" width="1" height="1" fill="#FF4FB0" />
              <rect x="6" y="3" width="1" height="1" fill="#FF4FB0" />
              <rect x="11" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="4" width="1" height="1" fill="#FF4FB0" />
              <rect x="5" y="4" width="1" height="1" fill="#FF4FB0" />
              <rect x="6" y="4" width="1" height="1" fill="#FF4FB0" />
              <rect x="7" y="4" width="1" height="1" fill="#FF4FB0" />
              <rect x="11" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="5" width="1" height="1" fill="#FF4FB0" />
              <rect x="4" y="5" width="1" height="1" fill="#FF4FB0" />
              <rect x="5" y="5" width="1" height="1" fill="#FF4FB0" />
              <rect x="6" y="5" width="1" height="1" fill="#FF4FB0" />
              <rect x="7" y="5" width="1" height="1" fill="#FF4FB0" />
              <rect x="8" y="5" width="1" height="1" fill="#FF4FB0" />
              <rect x="11" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="6" width="1" height="1" fill="#FF4FB0" />
              <rect x="4" y="6" width="1" height="1" fill="#FF4FB0" />
              <rect x="5" y="6" width="1" height="1" fill="#FF4FB0" />
              <rect x="6" y="6" width="1" height="1" fill="#FF4FB0" />
              <rect x="7" y="6" width="1" height="1" fill="#FF4FB0" />
              <rect x="8" y="6" width="1" height="1" fill="#FF4FB0" />
              <rect x="11" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="7" width="1" height="1" fill="#FF4FB0" />
              <rect x="5" y="7" width="1" height="1" fill="#FF4FB0" />
              <rect x="6" y="7" width="1" height="1" fill="#FF4FB0" />
              <rect x="7" y="7" width="1" height="1" fill="#FF4FB0" />
              <rect x="11" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="8" width="1" height="1" fill="#FF4FB0" />
              <rect x="6" y="8" width="1" height="1" fill="#FF4FB0" />
              <rect x="11" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="2" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="12" width="1" height="1" fill="#EADFC8" />
            </svg>
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                fontFamily: 'Silkscreen,monospace',
                fontSize: '20px',
                letterSpacing: '1px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#4FE3D1' }}>PIX</span>
              <span style={{ color: '#EADFC8' }}>PEDIA</span>
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              fontFamily: 'Silkscreen,monospace',
              fontSize: '9px',
              letterSpacing: '2px',
              color: '#FF4FB0',
            }}
          >
            ÉDITION ARÈNE
          </div>
          <div
            style={{
              position: 'relative',
              fontFamily: 'Silkscreen,monospace',
              fontSize: '8px',
              color: '#2EE6FF',
            }}
          >
            {eventName.toUpperCase()}
          </div>
        </div>
        <div
          className="c-sheen"
          style={
            {
              position: 'absolute',
              inset: '0',
              borderRadius: '10px',
              overflow: 'hidden',
              pointerEvents: 'none',
              '--sh': 'rgba(255,180,230,.25)',
              '--shd': '4s',
            } as CSSProperties
          }
        ></div>
      </div>
    </>
  );
}

/** Dos standard teinté or, « ÉDITION VIP ». */
export function VipBack() {
  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '240px',
          height: '336px',
          borderRadius: '14px',
          background: '#E8C060',
          padding: '4px',
          boxSizing: 'border-box',
          boxShadow: '3px 3px 0 rgba(0,0,0,.5),0 22px 34px rgba(0,0,0,.55)',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: '100%',
            borderRadius: '11px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            background:
              'radial-gradient(ellipse 60% 45% at 50% 45%,rgba(79,227,209,.18),transparent 70%),#1E1828',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0',
              backgroundImage:
                'linear-gradient(rgba(79,227,209,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(79,227,209,.07) 1px,transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              inset: '10px',
              border: '1px solid #3A3147',
              borderRadius: '8px',
            }}
          ></div>
          <div style={{ position: 'relative' }}>
            <svg
              width="89"
              height="96"
              viewBox="0 0 12 13"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="2" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="12" width="1" height="1" fill="#EADFC8" />
            </svg>
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                fontFamily: 'Silkscreen,monospace',
                fontSize: '22px',
                letterSpacing: '1px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#4FE3D1' }}>PIX</span>
              <span style={{ color: '#EADFC8' }}>PEDIA</span>
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              fontFamily: 'Cinzel,serif',
              fontWeight: '700',
              fontSize: '9px',
              letterSpacing: '3px',
              color: '#A79DB3',
            }}
          >
            ÉDITION VIP
          </div>
        </div>
      </div>
    </>
  );
}

/** Dos standard teinté orange, « ÉDITION ÉVÉNEMENT ». */
export function EventBack() {
  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '240px',
          height: '336px',
          borderRadius: '14px',
          background: '#FF8A3D',
          padding: '4px',
          boxSizing: 'border-box',
          boxShadow: '3px 3px 0 rgba(0,0,0,.5),0 22px 34px rgba(0,0,0,.55)',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: '100%',
            borderRadius: '11px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            background:
              'radial-gradient(ellipse 60% 45% at 50% 45%,rgba(79,227,209,.18),transparent 70%),#1E1828',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0',
              backgroundImage:
                'linear-gradient(rgba(79,227,209,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(79,227,209,.07) 1px,transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              inset: '10px',
              border: '1px solid #3A3147',
              borderRadius: '8px',
            }}
          ></div>
          <div style={{ position: 'relative' }}>
            <svg
              width="89"
              height="96"
              viewBox="0 0 12 13"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <rect x="2" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="0" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="1" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="2" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="3" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="3" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="4" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="4" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="5" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="5" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="4" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="8" y="6" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="6" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="5" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="7" y="7" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="7" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="6" y="8" width="1" height="1" fill="#4FE3D1" />
              <rect x="11" y="8" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="9" width="1" height="1" fill="#EADFC8" />
              <rect x="0" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="11" y="10" width="1" height="1" fill="#EADFC8" />
              <rect x="1" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="10" y="11" width="1" height="1" fill="#EADFC8" />
              <rect x="2" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="3" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="4" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="5" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="6" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="7" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="8" y="12" width="1" height="1" fill="#EADFC8" />
              <rect x="9" y="12" width="1" height="1" fill="#EADFC8" />
            </svg>
          </div>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                fontFamily: 'Silkscreen,monospace',
                fontSize: '22px',
                letterSpacing: '1px',
                lineHeight: '1',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#4FE3D1' }}>PIX</span>
              <span style={{ color: '#EADFC8' }}>PEDIA</span>
            </span>
          </div>
          <div
            style={{
              position: 'relative',
              fontFamily: 'Cinzel,serif',
              fontWeight: '700',
              fontSize: '9px',
              letterSpacing: '3px',
              color: '#A79DB3',
            }}
          >
            ÉDITION ÉVÉNEMENT
          </div>
        </div>
      </div>
    </>
  );
}

/** Dos à afficher selon la priorité calculée par getCardBack (shared). */
export function CardBackOf({ kind, eventName }: { kind: CardBackKind; eventName?: string }) {
  switch (kind) {
    case 'boss':
      return <BossBack />;
    case 'final':
      return <FinalBack />;
    case 'hof':
      return <HofBack />;
    case 'holo':
      return <HoloBack />;
    case 'fullart':
      return <FullArtBack />;
    case 'arena':
      return <ArenaBack eventName={eventName} />;
    case 'vip':
      return <VipBack />;
    case 'event':
      return <EventBack />;
    default:
      return <StandardBack />;
  }
}
