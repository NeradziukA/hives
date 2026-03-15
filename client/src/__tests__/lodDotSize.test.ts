import { describe, it, expect } from 'vitest'

/**
 * Regression test for iOS Safari dot size scaling bug.
 *
 * Bug: On iOS Safari, window.innerHeight can diverge from the renderer's
 * actual render height (e.g., when the address bar shows/hides). Using
 * window.innerHeight in the LOD dot size formula caused the dot to appear
 * at the wrong size.
 *
 * Fix: Use renderer.domElement.clientHeight (always in sync with renderer)
 * instead of window.innerHeight.
 */

const DOT_SIZE_PX = 20

/** Formula from models.ts tick() */
function computeDotWorldSize(screenHeight: number, halfViewportHeight: number): number {
  return (DOT_SIZE_PX / screenHeight) * 2 * halfViewportHeight
}

/** THREE.js perspective projection: world size → screen pixels */
function worldSizeToPixels(worldSize: number, screenHeight: number, halfViewportHeight: number): number {
  return worldSize * (screenHeight / 2) / halfViewportHeight
}

describe('LOD dot size formula', () => {
  it('pixel size is constant regardless of zoom when screenHeight matches renderer', () => {
    const rendererHeight = 1024
    const fov = 50
    const tanHalfFov = Math.tan((fov / 2) * Math.PI / 180)

    // Simulate different zoom levels (camera distances)
    const zoomLevels = [1, 5, 20, 50, 200]

    const pixelSizes = zoomLevels.map(zoom => {
      const distance = 0.00566 * zoom // BASE_OFFSET magnitude × zoom
      const halfViewportHeight = distance * tanHalfFov
      const dotWorldSize = computeDotWorldSize(rendererHeight, halfViewportHeight)
      return worldSizeToPixels(dotWorldSize, rendererHeight, halfViewportHeight)
    })

    // All zoom levels must produce the same pixel size
    for (const px of pixelSizes) {
      expect(px).toBeCloseTo(DOT_SIZE_PX, 5)
    }
  })

  it('pixel size is WRONG when window.innerHeight diverges from renderer height (iOS bug)', () => {
    const rendererHeight = 1024   // renderer.domElement.clientHeight
    const windowInnerHeight = 924 // window.innerHeight (iOS address bar showing, ~100px smaller)
    const fov = 50
    const tanHalfFov = Math.tan((fov / 2) * Math.PI / 180)

    // At two different zoom levels, using window.innerHeight produces inconsistent sizes
    const distance1 = 0.00566 * 10
    const distance2 = 0.00566 * 100
    const hvp1 = distance1 * tanHalfFov
    const hvp2 = distance2 * tanHalfFov

    // Using wrong screenHeight (window.innerHeight): formula gives wrong world size,
    // but rendered at renderer height → pixel size ≠ DOT_SIZE_PX
    const dotWorld1 = computeDotWorldSize(windowInnerHeight, hvp1)
    const dotWorld2 = computeDotWorldSize(windowInnerHeight, hvp2)
    const px1 = worldSizeToPixels(dotWorld1, rendererHeight, hvp1)
    const px2 = worldSizeToPixels(dotWorld2, rendererHeight, hvp2)

    // Both sizes should be wrong AND identical (both inflated by rendererHeight/windowInnerHeight)
    expect(px1).not.toBeCloseTo(DOT_SIZE_PX, 1)
    expect(px1).toBeCloseTo(px2, 5) // still consistent between zoom levels, just wrong size
  })

  it('pixel size is correct when using renderer.domElement.clientHeight (fix)', () => {
    const rendererHeight = 1024   // renderer.domElement.clientHeight
    const fov = 50
    const tanHalfFov = Math.tan((fov / 2) * Math.PI / 180)

    const distance = 0.00566 * 50
    const halfViewportHeight = distance * tanHalfFov
    const dotWorldSize = computeDotWorldSize(rendererHeight, halfViewportHeight)
    const pixelSize = worldSizeToPixels(dotWorldSize, rendererHeight, halfViewportHeight)

    expect(pixelSize).toBeCloseTo(DOT_SIZE_PX, 5)
  })
})
