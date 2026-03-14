import { metersToLatitudeDegrees, metersToLongitudeDegrees } from "./constants";

// Circumscribed circle radius of one hex cell in meters.
// Covers the base vision_radius (200 m) with slight neighbour overlap.
export const HEX_RADIUS_METERS = 150;

// Grid origin — Gdansk (game start location).
const ORIGIN_LAT = 54.352;
const ORIGIN_LNG = 18.6466;

const SQRT3 = Math.sqrt(3);

// Metres per degree at origin latitude — used for both directions to keep
// the projection linear (good enough for city-scale distances).
const M_PER_LAT = 1 / metersToLatitudeDegrees(1);           // ~111320
const M_PER_LNG = 1 / metersToLongitudeDegrees(1, ORIGIN_LAT);

export interface HexCell {
  id:  string;  // "q:r"
  q:   number;
  r:   number;
  lat: number;  // centre latitude
  lng: number;  // centre longitude
}

// ---------------------------------------------------------------------------
// Internal: axial ↔ cartesian (metres from origin), pointy-top orientation
// ---------------------------------------------------------------------------

function axialToMetres(q: number, r: number, size: number): { x: number; y: number } {
  return {
    x: size * (SQRT3 * q + SQRT3 / 2 * r),
    y: size * (3 / 2 * r),
  };
}

function metresToAxialFrac(x: number, y: number, size: number): { q: number; r: number } {
  return {
    q: (SQRT3 / 3 * x - 1 / 3 * y) / size,
    r: (2 / 3 * y) / size,
  };
}

// Round fractional axial coords to the nearest hex via cube-coordinate rounding.
function hexRound(q: number, r: number): { q: number; r: number } {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds)        rr = -rq - rs;
  return { q: rq, r: rr };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Return the hex cell whose area contains the given geographic point. */
export function latLngToHex(lat: number, lng: number): HexCell {
  const x = (lng - ORIGIN_LNG) * M_PER_LNG;
  const y = (lat - ORIGIN_LAT) * M_PER_LAT;
  const frac = metresToAxialFrac(x, y, HEX_RADIUS_METERS);
  const { q, r } = hexRound(frac.q, frac.r);
  return hexCenter(q, r);
}

/** Build a HexCell from axial coordinates, computing its geographic centre. */
export function hexCenter(q: number, r: number): HexCell {
  const { x, y } = axialToMetres(q, r, HEX_RADIUS_METERS);
  return {
    id:  `${q}:${r}`,
    q,
    r,
    lat: ORIGIN_LAT + y / M_PER_LAT,
    lng: ORIGIN_LNG + x / M_PER_LNG,
  };
}

/** Parse a cell id string ("q:r") and return the corresponding HexCell. */
export function hexById(id: string): HexCell {
  const [q, r] = id.split(":").map(Number);
  return hexCenter(q, r);
}

// Six neighbour directions for a pointy-top hex grid (axial offsets).
const HEX_DIRECTIONS: [number, number][] = [
  [+1,  0], [+1, -1], [ 0, -1],
  [-1,  0], [-1, +1], [ 0, +1],
];

/** Return the six neighbouring HexCells of a given cell. */
export function hexNeighbors(q: number, r: number): HexCell[] {
  return HEX_DIRECTIONS.map(([dq, dr]) => hexCenter(q + dq, r + dr));
}

/** Return the grid distance (in hex steps) between two cells. */
export function hexDistance(q1: number, r1: number, q2: number, r2: number): number {
  return (Math.abs(q1 - q2) + Math.abs(q1 + r1 - q2 - r2) + Math.abs(r1 - r2)) / 2;
}

/** Return all cells within `radius` steps of (q, r), including the centre. */
export function hexRange(q: number, r: number, radius: number): HexCell[] {
  const results: HexCell[] = [];
  for (let dq = -radius; dq <= radius; dq++) {
    const rMin = Math.max(-radius, -dq - radius);
    const rMax = Math.min( radius, -dq + radius);
    for (let dr = rMin; dr <= rMax; dr++) {
      results.push(hexCenter(q + dq, r + dr));
    }
  }
  return results;
}
