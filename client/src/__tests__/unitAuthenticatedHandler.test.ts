import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleUnitAuthenticated } from '../handlers/unitAuthenticatedHandler'

// Capture the callback that LocationTracker receives so tests can trigger it manually
const tracker = vi.hoisted(() => ({
  callback: null as null | ((coords: { lat: number; lon: number }) => void),
  interval: undefined as number | undefined,
  constructorCallCount: 0,
  stopTrackingCallCount: 0,
}))

vi.mock('../location', () => ({
  default: class {
    constructor(cb: (coords: { lat: number; lon: number }) => void, interval?: number) {
      tracker.constructorCallCount++
      tracker.callback = cb
      tracker.interval = interval
    }
    stopTracking() {
      tracker.stopTrackingCallCount++
    }
  },
}))

vi.mock('../sceneSetup', () => ({
  setDriftSpeed: vi.fn(),
}))

import { setDriftSpeed } from '../sceneSetup'

const makeSocket = () => ({ send: vi.fn() }) as unknown as WebSocket

beforeEach(() => {
  vi.clearAllMocks()
  tracker.callback = null
  tracker.interval = undefined
  tracker.constructorCallCount = 0
  tracker.stopTrackingCallCount = 0
  localStorage.clear()
})

// ---------------------------------------------------------------------------

describe('handleUnitAuthenticated — setup', () => {
  it('calls setMyId with srcId from the message', () => {
    const setMyId = vi.fn()
    handleUnitAuthenticated({ srcId: 'player-42' }, makeSocket(), setMyId)
    expect(setMyId).toHaveBeenCalledWith('player-42')
  })

  it('persists srcId in localStorage', () => {
    handleUnitAuthenticated({ srcId: 'player-42' }, makeSocket(), vi.fn())
    expect(localStorage.getItem('playerId')).toBe('player-42')
  })

  it('calls setDriftSpeed when cameraDriftSpeed is provided', () => {
    handleUnitAuthenticated(
      { srcId: 'p1', payload: { config: { cameraDriftSpeed: 0.5 } } },
      makeSocket(), vi.fn(),
    )
    expect(setDriftSpeed).toHaveBeenCalledWith(0.5)
  })

  it('calls setDriftSpeed when cameraDriftSpeed is 0 (falsy but defined)', () => {
    handleUnitAuthenticated(
      { srcId: 'p1', payload: { config: { cameraDriftSpeed: 0 } } },
      makeSocket(), vi.fn(),
    )
    expect(setDriftSpeed).toHaveBeenCalledWith(0)
  })

  it('does not call setDriftSpeed when cameraDriftSpeed is absent', () => {
    handleUnitAuthenticated({ srcId: 'p1', payload: {} }, makeSocket(), vi.fn())
    expect(setDriftSpeed).not.toHaveBeenCalled()
  })

  it('does not call setDriftSpeed when payload is absent', () => {
    handleUnitAuthenticated({ srcId: 'p1' }, makeSocket(), vi.fn())
    expect(setDriftSpeed).not.toHaveBeenCalled()
  })

  it('passes locationUpdateInterval from payload to LocationTracker', () => {
    handleUnitAuthenticated(
      { srcId: 'p1', payload: { config: { locationUpdateInterval: 5000 } } },
      makeSocket(), vi.fn(),
    )
    expect(tracker.interval).toBe(5000)
  })

  it('passes undefined interval when config is absent (LocationTracker uses its default)', () => {
    handleUnitAuthenticated({ srcId: 'p1' }, makeSocket(), vi.fn())
    expect(tracker.interval).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------

describe('handleUnitAuthenticated — first location update', () => {
  it('sends UNIT_GET_ALL on the first callback invocation', () => {
    const socket = makeSocket()
    handleUnitAuthenticated({ srcId: 'player-1' }, socket, vi.fn())

    tracker.callback!({ lat: 55.0, lon: 37.0 })

    const calls = socket.send.mock.calls.map(([raw]: [string]) => JSON.parse(raw))
    const getAll = calls.find((m: { type: string }) => m.type === 'UNIT_GET_ALL')
    expect(getAll).toBeDefined()
    expect(getAll.srcId).toBe('player-1')
    expect(getAll.payload.coords).toEqual({ lat: 55.0, lon: 37.0 })
  })

  it('sends UNIT_MOVED on the first callback invocation', () => {
    const socket = makeSocket()
    handleUnitAuthenticated({ srcId: 'player-1' }, socket, vi.fn())

    tracker.callback!({ lat: 55.0, lon: 37.0 })

    const calls = socket.send.mock.calls.map(([raw]: [string]) => JSON.parse(raw))
    const moved = calls.find((m: { type: string }) => m.type === 'UNIT_MOVED')
    expect(moved).toBeDefined()
    expect(moved.payload.coords).toEqual({ lat: 55.0, lon: 37.0 })
  })

  it('sends exactly 2 messages on the first location update (UNIT_GET_ALL + UNIT_MOVED)', () => {
    const socket = makeSocket()
    handleUnitAuthenticated({ srcId: 'player-1' }, socket, vi.fn())

    tracker.callback!({ lat: 55.0, lon: 37.0 })

    expect(socket.send).toHaveBeenCalledTimes(2)
  })

  it('calls onOwnMove on the first callback invocation', () => {
    const onOwnMove = vi.fn()
    handleUnitAuthenticated({ srcId: 'p1' }, makeSocket(), vi.fn(), onOwnMove)

    tracker.callback!({ lat: 10, lon: 20 })

    expect(onOwnMove).toHaveBeenCalledWith({ lat: 10, lon: 20 })
  })
})

// ---------------------------------------------------------------------------

describe('handleUnitAuthenticated — subsequent location updates', () => {
  it('does NOT send UNIT_GET_ALL on the second invocation', () => {
    const socket = makeSocket()
    handleUnitAuthenticated({ srcId: 'player-1' }, socket, vi.fn())

    tracker.callback!({ lat: 55.0, lon: 37.0 })
    socket.send.mockClear()

    tracker.callback!({ lat: 55.1, lon: 37.1 })

    const calls = socket.send.mock.calls.map(([raw]: [string]) => JSON.parse(raw))
    const getAll = calls.find((m: { type: string }) => m.type === 'UNIT_GET_ALL')
    expect(getAll).toBeUndefined()
  })

  it('keeps sending UNIT_MOVED on every subsequent invocation', () => {
    const socket = makeSocket()
    handleUnitAuthenticated({ srcId: 'player-1' }, socket, vi.fn())

    tracker.callback!({ lat: 55.0, lon: 37.0 })
    socket.send.mockClear()

    tracker.callback!({ lat: 55.1, lon: 37.1 })

    const calls = socket.send.mock.calls.map(([raw]: [string]) => JSON.parse(raw))
    const moved = calls.find((m: { type: string }) => m.type === 'UNIT_MOVED')
    expect(moved).toBeDefined()
    expect(moved.payload.coords).toEqual({ lat: 55.1, lon: 37.1 })
  })

  it('keeps calling onOwnMove on every invocation', () => {
    const onOwnMove = vi.fn()
    handleUnitAuthenticated({ srcId: 'p1' }, makeSocket(), vi.fn(), onOwnMove)

    tracker.callback!({ lat: 1, lon: 2 })
    tracker.callback!({ lat: 3, lon: 4 })

    expect(onOwnMove).toHaveBeenCalledTimes(2)
    expect(onOwnMove).toHaveBeenLastCalledWith({ lat: 3, lon: 4 })
  })

  it('works correctly when onOwnMove is not provided', () => {
    handleUnitAuthenticated({ srcId: 'p1' }, makeSocket(), vi.fn())
    expect(() => tracker.callback!({ lat: 1, lon: 2 })).not.toThrow()
  })
})

// ---------------------------------------------------------------------------

describe('handleUnitAuthenticated — reconnect behaviour', () => {
  it('creates exactly one LocationTracker on a single call', () => {
    handleUnitAuthenticated({ srcId: 'player-1' }, makeSocket(), vi.fn())
    expect(tracker.constructorCallCount).toBe(1)
  })

  it('calls stopTracking on the previous tracker before creating a new one', () => {
    const socket = makeSocket()
    handleUnitAuthenticated({ srcId: 'player-1' }, socket, vi.fn())
    const stopCountAfterFirst = tracker.stopTrackingCallCount

    // Second call must stop the tracker created by the first call
    handleUnitAuthenticated({ srcId: 'player-1' }, socket, vi.fn())
    expect(tracker.stopTrackingCallCount).toBe(stopCountAfterFirst + 1)
    expect(tracker.constructorCallCount).toBe(2)
  })

  it('only one tracker is active after reconnect — sends UNIT_GET_ALL exactly once per connect', () => {
    const socket = makeSocket()
    handleUnitAuthenticated({ srcId: 'player-1' }, socket, vi.fn())
    tracker.callback!({ lat: 1, lon: 2 })
    socket.send.mockClear()

    // Reconnect: new tracker replaces old
    handleUnitAuthenticated({ srcId: 'player-1' }, socket, vi.fn())
    tracker.callback!({ lat: 3, lon: 4 })

    const calls = socket.send.mock.calls.map(([raw]: [string]) => JSON.parse(raw))
    const getAllCalls = calls.filter((m: { type: string }) => m.type === 'UNIT_GET_ALL')
    // Exactly one UNIT_GET_ALL from the new tracker (not two from two live trackers)
    expect(getAllCalls).toHaveLength(1)
  })
})
