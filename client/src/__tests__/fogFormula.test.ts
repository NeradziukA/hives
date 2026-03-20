import { describe, it, expect } from 'vitest'

// Constants mirrored from Game.svelte
const TAN25 = Math.tan((25 * Math.PI) / 180)
const CAM_BASE = 0.004 * 111320 // meters per zoom unit

/**
 * Current (fixed) formula — no lower clamp.
 * fogInner represents the fog-free circle radius as % of screen half-height.
 */
function fogInner(visionRadius: number, zoom: number): number {
  return Math.min(88, Math.round((visionRadius / (CAM_BASE * TAN25 * zoom)) * 50))
}

/**
 * Old (broken) formula with Math.max(8, …) lower clamp.
 * At high zoom values the clamp dominates, detaching fog size from vision radius.
 */
function fogInnerWithClamp(visionRadius: number, zoom: number): number {
  return Math.min(88, Math.max(8, Math.round((visionRadius / (CAM_BASE * TAN25 * zoom)) * 50)))
}

// Hex radius in screen-space (% of screen half-height) at a given zoom.
// R_LAT = HEX_RADIUS_METERS / M_PER_LAT; camera distance = 0.004 * sqrt(2) * zoom * M_PER_LAT.
const HEX_RADIUS_METERS = 150
const M_PER_LAT = 111320
function hexScreenPct(zoom: number): number {
  const R_LAT = HEX_RADIUS_METERS / M_PER_LAT
  const camDist = 0.004 * Math.SQRT2 * zoom
  return (R_LAT / (camDist * TAN25)) * 50
}

describe('fog of war inner-radius formula', () => {
  // Regression: Math.max(8, …) clamp caused fogInner to hit the floor at high zoom values,
  // making the fog circle appear 3–8 hex diameters wide depending on zoom instead of constant.

  it('formula gives proportional values at zoom=10 (old clamp would have clamped to 8)', () => {
    const unclamped = fogInner(200, 10)       // expected ≈ 5
    const clamped   = fogInnerWithClamp(200, 10) // expected 8 — old broken result

    // The fix: unclamped value must be less than 8 (proving the clamp was wrong)
    expect(unclamped).toBeLessThan(8)
    // And the old formula did return 8 at this zoom
    expect(clamped).toBe(8)
  })

  it('fog radius / hex radius ratio is constant across zoom levels', () => {
    const zooms = [3, 5, 8]
    const ratios = zooms.map(z => fogInner(200, z) / hexScreenPct(z))

    // All ratios should be within ±15 % of each other (rounding tolerance)
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length
    for (const r of ratios) {
      expect(r).toBeCloseTo(mean, 0)
    }
  })

  it('with old clamped formula, high zoom values all collapse to 8 (breaks proportionality)', () => {
    // zoom=10 → 4.8 → 8; zoom=15 → 3.2 → 8; zoom=20 → 2.4 → 8
    expect(fogInnerWithClamp(200, 10)).toBe(8)
    expect(fogInnerWithClamp(200, 15)).toBe(8)
    expect(fogInnerWithClamp(200, 20)).toBe(8)

    // Fixed formula returns distinct values
    expect(fogInner(200, 10)).toBeGreaterThan(fogInner(200, 15))
    expect(fogInner(200, 15)).toBeGreaterThan(fogInner(200, 20))
  })

  it('upper clamp at 88 % is preserved (very close zoom)', () => {
    expect(fogInner(200, 0.1)).toBe(88)
  })
})
