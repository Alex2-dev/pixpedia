/**
 * Particules des drops, extraites de docs/design/pixpedia-animations.html (positions en px
 * dans la scène 390 × 844, délais et durées en secondes). Généré, ne pas éditer à la main.
 * Hall of Fame : une particule sur deux par salve (7 ou 8 au lieu de 14-16) et 16 confettis au lieu de 40,
 * pour rester sous 40 particules visibles à la fois (écart validé, voir docs/decisions.md).
 */

export interface Spark {
  left: number;
  top: number;
  w: number;
  h: number;
  color: string;
  dx: number;
  dy: number;
}
export interface Frag extends Spark {
  r: number;
}
export interface Timed {
  left: number;
  top: number;
  w: number;
  h: number;
  color: string;
  delay: number;
  duration: number;
}
export interface Conv {
  left: number;
  top: number;
  w: number;
  h: number;
  color: string;
  x: number;
  y: number;
  delay: number;
}
export interface Firework extends Spark {
  delay: number;
}

export const FINAL_SPARKS: Spark[] = [
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: 160, dy: 0 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: 138, dy: 80 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: 79, dy: 138 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: 0, dy: 159 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: -80, dy: 138 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: -138, dy: 79 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: -159, dy: 0 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: -138, dy: -80 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: -79, dy: -138 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: 0, dy: -159 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: 80, dy: -138 },
  { left: 193, top: 378, w: 5, h: 5, color: '#FFC46B', dx: 138, dy: -79 },
];

export const FINAL_FRAGS: Frag[] = [
  { left: 145, top: 251, w: 18, h: 22, color: '#2E2639', dx: -220, dy: 143, r: -246 },
  { left: 149, top: 355, w: 18, h: 18, color: '#2E2639', dx: 197, dy: -210, r: -46 },
  { left: 256, top: 387, w: 14, h: 22, color: '#4FE3D1', dx: -207, dy: 90, r: 213 },
  { left: 204, top: 496, w: 18, h: 22, color: '#1E1828', dx: 69, dy: -233, r: 75 },
  { left: 260, top: 360, w: 14, h: 18, color: '#2E2639', dx: 220, dy: 78, r: -218 },
  { left: 265, top: 390, w: 14, h: 22, color: '#2E2639', dx: -205, dy: -249, r: -184 },
  { left: 162, top: 326, w: 14, h: 22, color: '#1E1828', dx: -214, dy: -251, r: -298 },
  { left: 210, top: 348, w: 18, h: 18, color: '#4FE3D1', dx: 188, dy: 63, r: -69 },
  { left: 131, top: 488, w: 22, h: 18, color: '#1E1828', dx: -176, dy: 3, r: 352 },
  { left: 125, top: 275, w: 18, h: 18, color: '#1E1828', dx: 140, dy: 92, r: 242 },
  { left: 138, top: 382, w: 22, h: 22, color: '#EADFC8', dx: -42, dy: -199, r: -311 },
  { left: 165, top: 307, w: 14, h: 22, color: '#4FE3D1', dx: -137, dy: -73, r: -347 },
  { left: 146, top: 332, w: 18, h: 18, color: '#EADFC8', dx: -178, dy: -123, r: 201 },
  { left: 218, top: 376, w: 22, h: 14, color: '#4FE3D1', dx: 77, dy: 146, r: 197 },
  { left: 174, top: 275, w: 22, h: 22, color: '#2E2639', dx: -188, dy: -71, r: -220 },
  { left: 121, top: 293, w: 22, h: 18, color: '#EADFC8', dx: -190, dy: 201, r: 292 },
];

export const FINAL_EMBERS: Timed[] = [
  { left: 67, top: 487, w: 4, h: 3, color: '#FF8A3D', delay: 2.26, duration: 3.23 },
  { left: 333, top: 606, w: 3, h: 3, color: '#FFE08A', delay: 2.99, duration: 2.92 },
  { left: 249, top: 584, w: 5, h: 3, color: '#FFB13D', delay: 2.18, duration: 2.91 },
  { left: 132, top: 501, w: 3, h: 3, color: '#FF8A3D', delay: 3.05, duration: 2.82 },
  { left: 283, top: 486, w: 5, h: 3, color: '#FF8A3D', delay: 1.97, duration: 2.48 },
  { left: 277, top: 594, w: 5, h: 3, color: '#FF8A3D', delay: 3.77, duration: 3.25 },
  { left: 94, top: 569, w: 5, h: 3, color: '#FF8A3D', delay: 3.36, duration: 2.29 },
  { left: 153, top: 507, w: 3, h: 3, color: '#FFB13D', delay: 1.95, duration: 2.97 },
  { left: 82, top: 575, w: 3, h: 5, color: '#FFB13D', delay: 2.74, duration: 2.78 },
  { left: 229, top: 500, w: 3, h: 3, color: '#FF8A3D', delay: 3.33, duration: 3.02 },
  { left: 47, top: 592, w: 4, h: 5, color: '#FFB13D', delay: 3.72, duration: 2.78 },
  { left: 253, top: 494, w: 4, h: 4, color: '#FF8A3D', delay: 3.01, duration: 2.33 },
  { left: 70, top: 550, w: 3, h: 4, color: '#FFB13D', delay: 3.4, duration: 3.46 },
  { left: 246, top: 481, w: 4, h: 3, color: '#FFB13D', delay: 2.44, duration: 2.37 },
  { left: 349, top: 562, w: 4, h: 5, color: '#FF8A3D', delay: 3.56, duration: 3.34 },
  { left: 260, top: 533, w: 3, h: 4, color: '#FF8A3D', delay: 2.72, duration: 2.92 },
  { left: 331, top: 596, w: 4, h: 4, color: '#FFB13D', delay: 2.46, duration: 2.09 },
  { left: 87, top: 523, w: 4, h: 5, color: '#FFB13D', delay: 2.18, duration: 3.07 },
];

export const HOF_CONVERGE: Conv[] = [
  { left: 193, top: 378, w: 4, h: 4, color: '#FFFFFF', x: -170, y: 286, delay: 0.35 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FF4FB0', x: 96, y: 352, delay: 0.76 },
  { left: 193, top: 378, w: 4, h: 4, color: '#2EE6FF', x: -2, y: -379, delay: 0.45 },
  { left: 193, top: 378, w: 4, h: 4, color: '#4FE3D1', x: 221, y: -199, delay: 0.78 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FFD23F', x: 259, y: 15, delay: 0.83 },
  { left: 193, top: 378, w: 4, h: 4, color: '#A05CFF', x: -29, y: 377, delay: 0.86 },
  { left: 193, top: 378, w: 4, h: 4, color: '#4FE3D1', x: 33, y: -376, delay: 0.43 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FFFFFF', x: -141, y: 318, delay: 0.2 },
  { left: 193, top: 378, w: 4, h: 4, color: '#2EE6FF', x: 13, y: 379, delay: 0.32 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FF4FB0', x: 259, y: 20, delay: 0.58 },
  { left: 193, top: 378, w: 4, h: 4, color: '#A05CFF', x: 251, y: 94, delay: 0.38 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FFD23F', x: -190, y: -258, delay: 1.08 },
  { left: 193, top: 378, w: 4, h: 4, color: '#4FE3D1', x: 258, y: -38, delay: 0.71 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FFFFFF', x: 259, y: -3, delay: 1.03 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FF4FB0', x: -259, y: -8, delay: 0.88 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FFD23F', x: 257, y: 56, delay: 0.59 },
  { left: 193, top: 378, w: 4, h: 4, color: '#2EE6FF', x: -114, y: 341, delay: 1.01 },
  { left: 193, top: 378, w: 4, h: 4, color: '#A05CFF', x: 60, y: -369, delay: 0.72 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FF4FB0', x: 128, y: -330, delay: 1.08 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FFFFFF', x: -166, y: -291, delay: 0.86 },
  { left: 193, top: 378, w: 4, h: 4, color: '#4FE3D1', x: 33, y: 376, delay: 0.34 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FFFFFF', x: -256, y: -64, delay: 0.84 },
  { left: 193, top: 378, w: 4, h: 4, color: '#2EE6FF', x: -257, y: 53, delay: 0.92 },
  { left: 193, top: 378, w: 4, h: 4, color: '#2EE6FF', x: -181, y: -272, delay: 1.02 },
  { left: 193, top: 378, w: 4, h: 4, color: '#4FE3D1', x: -20, y: 378, delay: 0.38 },
  { left: 193, top: 378, w: 4, h: 4, color: '#FFD23F', x: 245, y: -125, delay: 0.91 },
];

export const HOF_FIREWORKS: Firework[] = [
  { left: 80, top: 150, w: 5, h: 5, color: '#2EE6FF', dx: 110, dy: 0, delay: 2.7 },
  { left: 80, top: 150, w: 5, h: 5, color: '#FF4FB0', dx: 68, dy: 85, delay: 2.7 },
  { left: 80, top: 150, w: 5, h: 5, color: '#4FE3D1', dx: -24, dy: 107, delay: 2.7 },
  { left: 80, top: 150, w: 5, h: 5, color: '#2EE6FF', dx: -99, dy: 47, delay: 2.7 },
  { left: 80, top: 150, w: 5, h: 5, color: '#FF4FB0', dx: -99, dy: -47, delay: 2.7 },
  { left: 80, top: 150, w: 5, h: 5, color: '#4FE3D1', dx: -24, dy: -107, delay: 2.7 },
  { left: 80, top: 150, w: 5, h: 5, color: '#2EE6FF', dx: 68, dy: -86, delay: 2.7 },
  { left: 310, top: 190, w: 5, h: 5, color: '#2EE6FF', dx: 110, dy: 0, delay: 3.05 },
  { left: 310, top: 190, w: 5, h: 5, color: '#FF4FB0', dx: 68, dy: 85, delay: 3.05 },
  { left: 310, top: 190, w: 5, h: 5, color: '#4FE3D1', dx: -24, dy: 107, delay: 3.05 },
  { left: 310, top: 190, w: 5, h: 5, color: '#2EE6FF', dx: -99, dy: 47, delay: 3.05 },
  { left: 310, top: 190, w: 5, h: 5, color: '#FF4FB0', dx: -99, dy: -47, delay: 3.05 },
  { left: 310, top: 190, w: 5, h: 5, color: '#4FE3D1', dx: -24, dy: -107, delay: 3.05 },
  { left: 310, top: 190, w: 5, h: 5, color: '#2EE6FF', dx: 68, dy: -86, delay: 3.05 },
  { left: 200, top: 90, w: 5, h: 5, color: '#2EE6FF', dx: 130, dy: 0, delay: 3.4 },
  { left: 200, top: 90, w: 5, h: 5, color: '#FF4FB0', dx: 91, dy: 91, delay: 3.4 },
  { left: 200, top: 90, w: 5, h: 5, color: '#4FE3D1', dx: 0, dy: 129, delay: 3.4 },
  { left: 200, top: 90, w: 5, h: 5, color: '#2EE6FF', dx: -91, dy: 91, delay: 3.4 },
  { left: 200, top: 90, w: 5, h: 5, color: '#FF4FB0', dx: -129, dy: 0, delay: 3.4 },
  { left: 200, top: 90, w: 5, h: 5, color: '#4FE3D1', dx: -91, dy: -91, delay: 3.4 },
  { left: 200, top: 90, w: 5, h: 5, color: '#2EE6FF', dx: 0, dy: -129, delay: 3.4 },
  { left: 200, top: 90, w: 5, h: 5, color: '#FF4FB0', dx: 91, dy: -91, delay: 3.4 },
  { left: 110, top: 520, w: 5, h: 5, color: '#2EE6FF', dx: 110, dy: 0, delay: 3.75 },
  { left: 110, top: 520, w: 5, h: 5, color: '#FF4FB0', dx: 68, dy: 85, delay: 3.75 },
  { left: 110, top: 520, w: 5, h: 5, color: '#4FE3D1', dx: -24, dy: 107, delay: 3.75 },
  { left: 110, top: 520, w: 5, h: 5, color: '#2EE6FF', dx: -99, dy: 47, delay: 3.75 },
  { left: 110, top: 520, w: 5, h: 5, color: '#FF4FB0', dx: -99, dy: -47, delay: 3.75 },
  { left: 110, top: 520, w: 5, h: 5, color: '#4FE3D1', dx: -24, dy: -107, delay: 3.75 },
  { left: 110, top: 520, w: 5, h: 5, color: '#2EE6FF', dx: 68, dy: -86, delay: 3.75 },
  { left: 290, top: 470, w: 5, h: 5, color: '#2EE6FF', dx: 110, dy: 0, delay: 4.1 },
  { left: 290, top: 470, w: 5, h: 5, color: '#FF4FB0', dx: 68, dy: 85, delay: 4.1 },
  { left: 290, top: 470, w: 5, h: 5, color: '#4FE3D1', dx: -24, dy: 107, delay: 4.1 },
  { left: 290, top: 470, w: 5, h: 5, color: '#2EE6FF', dx: -99, dy: 47, delay: 4.1 },
  { left: 290, top: 470, w: 5, h: 5, color: '#FF4FB0', dx: -99, dy: -47, delay: 4.1 },
  { left: 290, top: 470, w: 5, h: 5, color: '#4FE3D1', dx: -24, dy: -107, delay: 4.1 },
  { left: 290, top: 470, w: 5, h: 5, color: '#2EE6FF', dx: 68, dy: -86, delay: 4.1 },
];

export const HOF_CONFETTI: Timed[] = [
  { left: 363, top: -20, w: 6, h: 4, color: '#FF4FB0', delay: 3.21, duration: 3.99 },
  { left: 351, top: -20, w: 8, h: 6, color: '#4FE3D1', delay: 4.23, duration: 2.82 },
  { left: 306, top: -20, w: 8, h: 10, color: '#FFD23F', delay: 4.14, duration: 2.54 },
  { left: 182, top: -20, w: 6, h: 4, color: '#FFFFFF', delay: 3.4, duration: 3.77 },
  { left: 369, top: -20, w: 6, h: 6, color: '#FFFFFF', delay: 2.94, duration: 3.76 },
  { left: 326, top: -20, w: 6, h: 6, color: '#A05CFF', delay: 2.49, duration: 3.38 },
  { left: 227, top: -20, w: 6, h: 4, color: '#2EE6FF', delay: 4.4, duration: 3.08 },
  { left: 122, top: -20, w: 6, h: 4, color: '#A05CFF', delay: 2.42, duration: 3.12 },
  { left: 143, top: -20, w: 4, h: 10, color: '#FFD23F', delay: 3.29, duration: 3.43 },
  { left: 75, top: -20, w: 8, h: 10, color: '#FF4FB0', delay: 2.89, duration: 3.33 },
  { left: 310, top: -20, w: 8, h: 10, color: '#A05CFF', delay: 3.78, duration: 3.97 },
  { left: 25, top: -20, w: 4, h: 6, color: '#4FE3D1', delay: 4.5, duration: 3.98 },
  { left: 266, top: -20, w: 8, h: 6, color: '#FFFFFF', delay: 2.56, duration: 2.61 },
  { left: 292, top: -20, w: 8, h: 6, color: '#FF4FB0', delay: 4.69, duration: 2.43 },
  { left: 255, top: -20, w: 6, h: 10, color: '#FF4FB0', delay: 2.91, duration: 3.35 },
  { left: 278, top: -20, w: 4, h: 6, color: '#FFD23F', delay: 2.54, duration: 4.01 },
];
