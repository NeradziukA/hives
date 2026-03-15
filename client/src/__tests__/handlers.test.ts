import { describe, it, expect, vi, beforeEach } from 'vitest'
import type * as THREE from 'three'

// --- Mocks ---

// Must be hoisted so the vi.mock factory below can reference it
const mockUnit = vi.hoisted(() => ({
  renderObj: { userData: {} as Record<string, unknown> },
  moveTo: vi.fn(),
}))

vi.mock('../models', () => ({
  UnitModel: {
    create: vi.fn().mockResolvedValue(mockUnit),
  },
}))

vi.mock('../ui/gameState.svelte.ts', () => ({
  pushMessage: vi.fn(),
}))

import { handleUnitMoved } from '../handlers/unitMovedHandler'
import { handleUnitDisconnected } from '../handlers/unitDisconnectedHandler'
import { handleUnitConnected } from '../handlers/unitConnectedHandler'
import { handleInitUnits } from '../handlers/initUnitsHandler'
import { pushMessage } from '../ui/gameState.svelte.ts'
import { UnitModel } from '../models'

/** Minimal THREE.Scene stand-in */
const makeScene = () => ({
  add: vi.fn(),
  remove: vi.fn(),
}) as unknown as THREE.Scene

beforeEach(() => {
  vi.clearAllMocks()
  mockUnit.renderObj.userData = {}
})

// ---------------------------------------------------------------------------

describe('handleUnitMoved', () => {
  it('calls moveTo with correct coordinates', () => {
    const units = new Map([['u1', mockUnit as never]])
    handleUnitMoved(
      { srcId: 'u1', payload: { coords: { lat: 55.5, lon: 37.5 } } },
      units,
    )
    expect(mockUnit.moveTo).toHaveBeenCalledOnce()
    const coords = mockUnit.moveTo.mock.calls[0][0]
    expect(coords.x).toBeCloseTo(55.5)
    expect(coords.y).toBeCloseTo(37.5)
  })

  it('does nothing for an unknown srcId', () => {
    const units = new Map()
    handleUnitMoved(
      { srcId: 'no-such-unit', payload: { coords: { lat: 1, lon: 2 } } },
      units,
    )
    expect(mockUnit.moveTo).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------

describe('handleUnitDisconnected', () => {
  it('removes the unit from the scene and the map', () => {
    const scene = makeScene()
    const units = new Map([['u1', mockUnit as never]])

    handleUnitDisconnected({ srcId: 'u1' }, scene, units)

    expect(scene.remove).toHaveBeenCalledWith(mockUnit.renderObj)
    expect(units.has('u1')).toBe(false)
  })

  it('broadcasts a message with the short id', () => {
    const scene = makeScene()
    const units = new Map([['abcdef123456', mockUnit as never]])

    handleUnitDisconnected({ srcId: 'abcdef123456' }, scene, units)

    expect(pushMessage).toHaveBeenCalledWith(expect.stringContaining('abcdef'))
  })

  it('does nothing for an unknown srcId', () => {
    const scene = makeScene()
    handleUnitDisconnected({ srcId: 'ghost' }, scene, new Map())
    expect(scene.remove).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------

describe('handleUnitConnected', () => {
  it('creates a unit, tags it, adds it to the scene and the map', async () => {
    const scene = makeScene()
    const units = new Map()

    await handleUnitConnected({ srcId: 'u2' }, scene, units)

    expect(UnitModel.create).toHaveBeenCalledOnce()
    expect(mockUnit.renderObj.userData.unitId).toBe('u2')
    expect(scene.add).toHaveBeenCalledWith(mockUnit.renderObj)
    expect(units.get('u2')).toBe(mockUnit)
  })

  it('pushes a connection message', async () => {
    const scene = makeScene()
    await handleUnitConnected({ srcId: 'abcdef999999' }, scene, new Map())
    expect(pushMessage).toHaveBeenCalledWith(expect.stringContaining('abcdef'))
  })

  it('does nothing when srcId is empty', async () => {
    const scene = makeScene()
    await handleUnitConnected({ srcId: '' }, scene, new Map())
    expect(UnitModel.create).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------

describe('handleInitUnits', () => {
  it('creates units for every remote user (skips own id)', async () => {
    const scene = makeScene()
    const units = new Map()

    await handleInitUnits(
      {
        payload: {
          users: {
            'remote-1': { coords: { lat: 55.0, lon: 37.0 } },
            'remote-2': { coords: { lat: 56.0, lon: 38.0 } },
            'my-id':    { coords: { lat: 57.0, lon: 39.0 } },
          },
        },
      },
      scene,
      units,
      'my-id',
    )

    // Two remote units created; own id skipped
    expect(UnitModel.create).toHaveBeenCalledTimes(2)
    expect(units.size).toBe(2)
    expect(units.has('remote-1')).toBe(true)
    expect(units.has('remote-2')).toBe(true)
    expect(units.has('my-id')).toBe(false)
  })

  it('handles staticObjects correctly', async () => {
    const scene = makeScene()
    const units = new Map()

    await handleInitUnits(
      {
        payload: {
          staticObjects: [
            { id: 'building-1', coords: { lat: 55.1, lon: 37.1 } },
          ],
        },
      },
      scene,
      units,
      'my-id',
    )

    expect(UnitModel.create).toHaveBeenCalledOnce()
    expect(units.has('building-1')).toBe(true)
  })

  it('handles empty payload gracefully', async () => {
    const scene = makeScene()
    await handleInitUnits({ payload: {} }, scene, new Map(), 'my-id')
    expect(UnitModel.create).not.toHaveBeenCalled()
  })
})
