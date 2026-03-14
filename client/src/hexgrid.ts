import * as THREE from "three";
import {
  latLngToHex,
  hexRange,
  HEX_RADIUS_METERS,
} from "../../lib/geo/geogrid";

// How many hex rings to render around the player cell
const RENDER_RADIUS = 10;

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
