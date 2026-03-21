import * as THREE from "three";
import {
  latLngToHex,
  hexRange,
  HEX_RADIUS_METERS,
} from "../../lib/geo/geogrid";

// How many hex rings to render around the player cell
const RENDER_RADIUS = 10;
// Fog covers a larger radius so it extends beyond hex-line rendering at high zoom
const FOG_RENDER_RADIUS = 150;

// Metres-to-degrees conversion (consistent with geogrid.ts origin)
const M_PER_LAT = 111320;
const M_PER_LNG = 111320 * Math.cos((54.352 * Math.PI) / 180);

// Hex radius in scene units (degrees)
const R_LAT = HEX_RADIUS_METERS / M_PER_LAT;
const R_LNG = HEX_RADIUS_METERS / M_PER_LNG;

// Pointy-top hex: vertex i at angle = 30 + 60*i degrees.
// In Three.js scene (X=lat=north, Z=lng=east):
//   scene X ← lat ← sin(angle) component
//   scene Z ← lng ← cos(angle) component
const VERTEX_ANGLES = Array.from(
  { length: 6 },
  (_, i) => ((30 + 60 * i) * Math.PI) / 180,
);

function hexCorners(lat: number, lng: number): [number, number, number][] {
  return VERTEX_ANGLES.map((a) => [
    lat + Math.sin(a) * R_LAT,
    0,
    lng + Math.cos(a) * R_LNG,
  ]);
}

// ─── Fog grid ────────────────────────────────────────────────────────────────

/**
 * Returns the set of hex IDs whose centres lie within radiusM metres of (lat, lng).
 * Used to build the visible-hex set for fog-of-war calculations.
 */
export function hexesInRadius(lat: number, lng: number, radiusM: number): Set<string> {
  const mPerLng = 111320 * Math.cos((lat * Math.PI) / 180);
  const center = latLngToHex(lat, lng);
  // +1 ring buffer ensures we never miss edge hexes due to rounding
  const rings = Math.ceil(radiusM / (HEX_RADIUS_METERS * Math.sqrt(3))) + 1;
  const candidates = hexRange(center.q, center.r, rings);
  const result = new Set<string>();
  for (const cell of candidates) {
    const dx = (cell.lng - lng) * mPerLng;
    const dy = (cell.lat - lat) * M_PER_LAT;
    if (Math.sqrt(dx * dx + dy * dy) <= radiusM) result.add(cell.id);
  }
  return result;
}

// Fog shader tuning — adjust FOG_NOISE_SCALE for swirl size (larger = finer)
const FOG_NOISE_SCALE = 80;

const FOG_VERT = /* glsl */`
  varying vec2 vWorldPos;
  varying float vEdgeDist;
  void main() {
    vWorldPos = vec2(position.x, position.z);
    // Centre vertex has w=0 in userData — we detect it by checking if this vertex
    // is the first of each triangle fan. Instead, pass distance from hex centre
    // via a simple heuristic: centre vertex is placed at even multiples of 3 in
    // the buffer, but GLSL has no index access. Use length of local offset from
    // the averaged centroid approximation — just pass 0 for now, dissolve via noise.
    vEdgeDist = 0.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FOG_FRAG = /* glsl */`
  #define FOG_NOISE_SCALE ${FOG_NOISE_SCALE.toFixed(1)}
  uniform float uTime;
  uniform vec2 uPlayerPos;
  uniform float uMaxFogDist;
  varying vec2 vWorldPos;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  // Gradient noise (Perlin-like) — no rectangular grid artifacts
  vec2 grad(vec2 p) { float a = hash(p) * 6.2831853; return vec2(cos(a), sin(a)); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(grad(i),              f),
          dot(grad(i + vec2(1,0)),  f - vec2(1,0)), u.x),
      mix(dot(grad(i + vec2(0,1)),  f - vec2(0,1)),
          dot(grad(i + vec2(1,1)),  f - vec2(1,1)), u.x),
      u.y
    ) * 0.5 + 0.5;
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p); p = p * 2.1 + vec2(1.7, 9.2); a *= 0.5;
    }
    return v;
  }
  void main() {
    vec2 q = vWorldPos * FOG_NOISE_SCALE;
    float f = fbm(q + vec2(uTime * 0.08, uTime * 0.05));
    f += 0.5 * fbm(q + vec2(-uTime * 0.06, uTime * 0.03) + vec2(f * 2.0));
    // Dissolve hex edges with high-frequency noise
    float edgeNoise = fbm(vWorldPos * FOG_NOISE_SCALE * 3.0 + vec2(uTime * 0.12));
    float dissolve = smoothstep(0.3, 0.7, edgeNoise);
    // Distance from player: 0 = near, 1 = max fog radius
    float dist = clamp(length(vWorldPos - uPlayerPos) / uMaxFogDist, 0.0, 1.0);
    // Closer to player: slightly lighter smoke; far away: pure black
    float brightness = (1.0 - dist) * f * 0.05;
    float opacity = mix(0.85 + f * 0.13, 0.99, dist) * (0.7 + 0.3 * dissolve);
    gl_FragColor = vec4(brightness, brightness, brightness, opacity);
  }
`;

export const fogMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPlayerPos: { value: new THREE.Vector2() },
    uMaxFogDist: { value: 0.01 },
  },
  vertexShader: FOG_VERT,
  fragmentShader: FOG_FRAG,
  transparent: true,
  side: THREE.DoubleSide,
  depthTest: false,
});

export function createFogGrid(): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), fogMaterial);
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * Rebuilds the fog mesh: every hex whose centre is more than visionRadius metres
 * from (lat, lng) is filled with a dark triangle fan.
 */
export function updateFogGrid(
  fog: THREE.Mesh,
  lat: number,
  lng: number,
  visibleHexIds: Set<string>,
): void {
  fogMaterial.uniforms.uPlayerPos.value.set(lat, lng);
  fogMaterial.uniforms.uMaxFogDist.value = (FOG_RENDER_RADIUS * HEX_RADIUS_METERS) / M_PER_LAT;

  const playerCell = latLngToHex(lat, lng);
  const cells = hexRange(playerCell.q, playerCell.r, FOG_RENDER_RADIUS);

  const fogCells = cells.filter((cell) => !visibleHexIds.has(cell.id));

  // 6 triangles per hex (fan from centre) × 3 vertices × 3 components
  const positions = new Float32Array(fogCells.length * 6 * 3 * 3);
  const FOG_Y = 0;
  let offset = 0;

  for (const cell of fogCells) {
    const corners = hexCorners(cell.lat, cell.lng);
    for (let i = 0; i < 6; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 6];
      // centre
      positions[offset++] = cell.lat; positions[offset++] = FOG_Y; positions[offset++] = cell.lng;
      // corner a
      positions[offset++] = a[0]; positions[offset++] = FOG_Y; positions[offset++] = a[2];
      // corner b
      positions[offset++] = b[0]; positions[offset++] = FOG_Y; positions[offset++] = b[2];
    }
  }

  fog.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  fog.geometry.computeBoundingSphere();
}

// ─── Hex-line grid ───────────────────────────────────────────────────────────

// Last rendered cell — avoid rebuilding geometry if the player hasn't moved cells
let lastCellId = "";

export function createHexGrid(): THREE.LineSegments {
  const material = new THREE.LineBasicMaterial({
    color: 0x72b53a,
    transparent: true,
    opacity: 0.01,
  });
  return new THREE.LineSegments(new THREE.BufferGeometry(), material);
}

export function updateHexGrid(
  lines: THREE.LineSegments,
  lat: number,
  lng: number,
): void {
  const playerCell = latLngToHex(lat, lng);
  if (playerCell.id === lastCellId) return;
  lastCellId = playerCell.id;

  const cells = hexRange(playerCell.q, playerCell.r, RENDER_RADIUS);

  // Each hex produces 6 edges × 2 endpoints = 12 vertices × 3 components
  const positions = new Float32Array(cells.length * 6 * 2 * 3);
  let offset = 0;

  for (const cell of cells) {
    const corners = hexCorners(cell.lat, cell.lng);
    for (let i = 0; i < 6; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 6];
      positions[offset++] = a[0];
      positions[offset++] = a[1];
      positions[offset++] = a[2];
      positions[offset++] = b[0];
      positions[offset++] = b[1];
      positions[offset++] = b[2];
    }
  }

  lines.geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );
  lines.geometry.computeBoundingSphere();
}
