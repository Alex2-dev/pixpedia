import { useId, type CSSProperties } from 'react';

/** Motifs pixel du design (une ligne = une rangée, `#` = pixel plein). */
export const PX = {
  starter: [
    '........',
    '........',
    '.######.',
    '##.##.##',
    '#...##.#',
    '##.##.##',
    '.##..##.',
    '........',
  ],
  bonus: [
    '...##...',
    '...##...',
    '########',
    '.######.',
    '..####..',
    '.##..##.',
    '##....##',
    '........',
  ],
  combo: [
    '....###.',
    '...###..',
    '..###...',
    '.######.',
    '...###..',
    '..###...',
    '.##.....',
    '#.......',
  ],
  boss: [
    '.######.',
    '########',
    '##.##.##',
    '#..##..#',
    '########',
    '.######.',
    '.#.##.#.',
    '........',
  ],
  final: [
    '#..##..#',
    '##.##.##',
    '########',
    '########',
    '.######.',
    '.######.',
    '........',
    '........',
  ],
  hof: [
    '########',
    '.######.',
    '#.####.#',
    '#.####.#',
    '.######.',
    '...##...',
    '..####..',
    '.######.',
  ],
  bracket: ['####', '#...', '#...', '#...'],
  flame: ['...#....', '..##....', '..###.#.', '.#####..', '.######.', '########', '########'],
  laurel: ['.#..', '.##.', '#.#.', '##..', '#.#.', '##..', '#.#.', '.##.', '..##'],
  spark: ['..#..', '..#..', '#####', '..#..', '..#..'],
  crown: ['#..#..#', '#######', '.#####.'],
  lock: ['.###.', '#...#', '#####', '##.##', '#####'],
  shield: ['#######', '#.....#', '#.###.#', '#.###.#', '.#.#.#.', '..#.#..', '...#...'],
  trophy: [
    '########',
    '.######.',
    '#.####.#',
    '#.####.#',
    '.######.',
    '...##...',
    '..####..',
    '.######.',
  ],
  logo: [
    '..########..',
    '.#........#.',
    '#..........#',
    '#....##....#',
    '#...####...#',
    '#..######..#',
    '#..######..#',
    '#...####...#',
    '#....##....#',
    '#..........#',
    '#..........#',
    '.#........#.',
    '..########..',
  ],
} as const;

export type PxName = keyof typeof PX;

function cells(rows: readonly string[]) {
  const out: { x: number; y: number }[] = [];
  rows.forEach((row, y) => [...row].forEach((c, x) => c === '#' && out.push({ x, y })));
  return out;
}

export function Px({
  name,
  color,
  scale,
  style,
}: {
  name: PxName;
  color: string;
  scale: number;
  style?: CSSProperties;
}) {
  const rows = PX[name];
  const w = rows[0]!.length;
  const h = rows.length;
  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      fill={color}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={style}
    >
      {cells(rows).map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
      ))}
    </svg>
  );
}

/** Logo Pixpedia : losange central en couleur d'accent. */
export function Logo({ size = 16, col = '#EADFC8', acc = '#4FE3D1' }) {
  return (
    <svg
      width={Math.round((size * 12) / 13)}
      height={size}
      viewBox="0 0 12 13"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {cells(PX.logo).map(({ x, y }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={y >= 3 && y <= 8 && x >= 3 && x <= 8 ? acc : col}
        />
      ))}
    </svg>
  );
}

export function Wordmark({ fs = 7 }: { fs?: number }) {
  return (
    <span className="wm" style={{ fontSize: fs }}>
      <b>PIX</b>PEDIA
    </span>
  );
}

export function Lock({ text, color }: { text: string; color: string }) {
  return (
    <span className="f-lock" style={{ color }}>
      <Px name="lock" color={color} scale={2} />
      {text}
    </span>
  );
}

function seedRand(seed: number) {
  let s = seed * 9301 + 49297;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

/** Paysage pixel généré, utilisé quand le jeu n'a pas de jaquette. */
export function Scene({
  seed,
  colors,
}: {
  seed: number;
  colors: readonly [string, string, string, string];
}) {
  const [sky1, sky2, hill, sun] = colors;
  const gradientId = useId();
  const rnd = seedRand(seed);
  let h = 18;
  const cols: number[] = [];
  for (let x = 0; x < 60; x++) {
    h += [-1, 0, 0, 1][Math.floor(rnd() * 4)]!;
    h = Math.max(10, Math.min(24, h));
    cols.push(h);
  }
  const stars = Array.from({ length: 14 }, () => ({
    x: Math.floor(rnd() * 60),
    y: Math.floor(rnd() * 11),
    o: [0.3, 0.5, 0.8][Math.floor(rnd() * 3)],
  }));
  return (
    <svg
      viewBox="0 0 60 30"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky1} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
      </defs>
      <rect width="60" height="30" fill={`url(#${gradientId})`} />
      {stars.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={1} height={1} fill="#fff" opacity={s.o} />
      ))}
      <rect x="42" y="5" width="6" height="6" fill={sun} />
      <rect x="41" y="6" width="8" height="4" fill={sun} />
      <g fill={hill} opacity={0.55}>
        {cols.map((c, x) => (
          <rect key={x} x={x} y={30 - c} width={1} height={c} />
        ))}
      </g>
      <g fill={hill}>
        {cols
          .slice()
          .reverse()
          .map((c, x) => {
            const v = Math.max(4, c - 9);
            return <rect key={x} x={x} y={30 - v} width={1} height={v} />;
          })}
      </g>
    </svg>
  );
}

/** Découpe en escalier des coins, pour le cadre Starter. */
export const step = (s: number) =>
  `polygon(0 ${s}px,${s}px ${s}px,${s}px 0,calc(100% - ${s}px) 0,calc(100% - ${s}px) ${s}px,100% ${s}px,100% calc(100% - ${s}px),calc(100% - ${s}px) calc(100% - ${s}px),calc(100% - ${s}px) 100%,${s}px 100%,${s}px calc(100% - ${s}px),0 calc(100% - ${s}px))`;
