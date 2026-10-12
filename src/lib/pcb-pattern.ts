// Generates a tileable printed-circuit-board pattern at build time, as two SVG masks:
// `traces` (copper under solder mask, plus silkscreen outlines and labels) and `copper`
// (exposed pads, vias and mounting holes). Colour comes from CSS, so it follows the theme.

type Point = [number, number];

const TILE = 1080;
const GRID = 12;

function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Eight compass directions; even indices are axis-aligned, odd ones are 45° diagonals.
const DIRS: Point[] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

export function buildPcbPattern(seed = 1831) {
  const rand = random(seed);
  const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const inBounds = ([x, y]: Point, margin = GRID * 2) => x >= margin && x <= TILE - margin && y >= margin && y <= TILE - margin;

  const traces: string[] = [];
  const silk: string[] = [];
  const labels: string[] = [];
  const copper: string[] = [];
  const via = ([x, y]: Point) => copper.push(`<circle cx="${x}" cy="${y}" r="4.5" fill="none" stroke="#fff" stroke-width="2.5"/>`);
  const pad = ([x, y]: Point, w = 9, h = 6) => copper.push(`<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="1" fill="#fff"/>`);

  // A trace runs straight, bends 45° through a short diagonal, then runs on: the classic PCB route.
  const route = (start: Point, direction: number, offset: Point = [0, 0]) => {
    const points: Point[] = [[start[0] + offset[0], start[1] + offset[1]]];
    let [x, y] = start;
    let dir = direction;
    const legs = int(2, 4);
    for (let leg = 0; leg < legs; leg++) {
      const length = int(4, 14) * GRID;
      const next: Point = [x + DIRS[dir][0] * length, y + DIRS[dir][1] * length];
      if (!inBounds(next)) break;
      [x, y] = next;
      points.push([x + offset[0], y + offset[1]]);
      const turn = pick([1, -1]);
      const diagonal = (dir + turn + 8) % 8;
      const chamfer = int(1, 3) * GRID;
      const bend: Point = [x + DIRS[diagonal][0] * chamfer, y + DIRS[diagonal][1] * chamfer];
      if (!inBounds(bend)) break;
      [x, y] = bend;
      points.push([x + offset[0], y + offset[1]]);
      dir = (diagonal + turn + 8) % 8;
    }
    return points;
  };

  const polyline = (points: Point[]) => `<polyline points="${points.map((p) => p.join(',')).join(' ')}"/>`;

  // Single traces from an SMD pad to a via.
  for (let i = 0; i < 26; i++) {
    const start: Point = [int(3, TILE / GRID - 3) * GRID, int(3, TILE / GRID - 3) * GRID];
    const points = route(start, pick([0, 2, 4, 6]));
    if (points.length < 2) continue;
    traces.push(polyline(points));
    pad(points[0]);
    via(points[points.length - 1]);
  }

  // Parallel buses: the same route repeated at a fixed pitch.
  for (let bus = 0; bus < 5; bus++) {
    const start: Point = [int(6, TILE / GRID - 12) * GRID, int(6, TILE / GRID - 12) * GRID];
    const dir = pick([0, 2]);
    const shape = route(start, dir);
    if (shape.length < 3) continue;
    const pitch = 8;
    const width = int(3, 5);
    for (let lane = 0; lane < width; lane++) {
      const offset: Point = dir === 0 ? [0, lane * pitch] : [lane * pitch, 0];
      const points = shape.map(([x, y]): Point => [x + offset[0], y + offset[1]]);
      traces.push(polyline(points));
      via(points[points.length - 1]);
    }
  }

  // IC footprints: silkscreen outline, pin-one dot, pads on two sides and a reference label.
  for (let ic = 0; ic < 3; ic++) {
    const pins = int(4, 7);
    const w = 60 + pins * 4;
    const h = pins * 10 + 8;
    const x = int(4, TILE / GRID - 12) * GRID;
    const y = int(4, TILE / GRID - 12) * GRID;
    silk.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none"/>`);
    silk.push(`<circle cx="${x + 7}" cy="${y + 7}" r="2" fill="#fff" stroke="none"/>`);
    for (let pin = 0; pin < pins; pin++) {
      const py = y + 9 + pin * 10;
      pad([x - 6, py], 10, 5);
      pad([x + w + 6, py], 10, 5);
    }
    labels.push(`<text x="${x}" y="${y - 6}">U${ic + 1}</text>`);
  }

  // Two-pad passives with outlines and reference designators.
  const designators = ['R', 'C', 'R', 'C', 'L', 'R', 'D', 'C', 'R', 'C', 'Q', 'R'];
  designators.forEach((letter, i) => {
    const x = int(3, TILE / GRID - 4) * GRID;
    const y = int(3, TILE / GRID - 3) * GRID;
    const vertical = rand() > 0.5;
    const [a, b]: Point[] = vertical ? [[x, y - 7], [x, y + 7]] : [[x - 7, y], [x + 7, y]];
    pad(a, vertical ? 8 : 6, vertical ? 6 : 8);
    pad(b, vertical ? 8 : 6, vertical ? 6 : 8);
    silk.push(vertical
      ? `<rect x="${x - 7}" y="${y - 13}" width="14" height="26" rx="2" fill="none"/>`
      : `<rect x="${x - 13}" y="${y - 7}" width="26" height="14" rx="2" fill="none"/>`);
    labels.push(`<text x="${x + (vertical ? 10 : -12)}" y="${y + (vertical ? 3 : -11)}">${letter}${i + 1}</text>`);
  });

  // Mounting holes near two corners.
  for (const [x, y] of [[30, 30], [TILE * 0.62, TILE - 40]] as Point[]) {
    copper.push(`<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="#fff" stroke-width="3.5"/>`);
  }

  const svg = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">${body}</svg>`;
  const traceLayer = svg(
    `<g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${traces.join('')}</g>`
    + `<g fill="none" stroke="#fff" stroke-width="1.2">${silk.join('')}</g>`
    + `<g fill="#fff" font-family="monospace" font-size="10">${labels.join('')}</g>`,
  );
  const copperLayer = svg(copper.join(''));
  const toUrl = (markup: string) => `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;

  return { tile: TILE, traces: toUrl(traceLayer), copper: toUrl(copperLayer) };
}
