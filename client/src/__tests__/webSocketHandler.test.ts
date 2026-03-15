import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock all heavy dependencies before importing the module under test
vi.mock('../models', () => ({
  UnitModel: { create: vi.fn() },
}))

vi.mock('../handlers/unitAuthenticatedHandler', () => ({
  handleUnitAuthenticated: vi.fn(),
}))

vi.mock('../handlers/unitConnectedHandler', () => ({
  handleUnitConnected: vi.fn(),
}))

vi.mock('../handlers/unitDisconnectedHandler', () => ({
  handleUnitDisconnected: vi.fn(),
}))

vi.mock('../handlers/unitMovedHandler', () => ({
  handleUnitMoved: vi.fn(),
}))

vi.mock('../handlers/initUnitsHandler', () => ({
  handleInitUnits: vi.fn(),
}))

// Minimal WebSocket stub used across tests
// Tracks the most recently created instance so tests can inspect it
let lastWs: {
  onopen: (() => void) | null
  onclose: ((e: CloseEvent) => void) | null
  onerror: ((e: Event) => void) | null
  onmessage: ((e: MessageEvent) => void) | null
  send: ReturnType<typeof vi.fn>
  close: ReturnType<typeof vi.fn>
}

function makeFakeWs() {
  const ws = {
    onopen: null as (() => void) | null,
    onclose: null as ((e: CloseEvent) => void) | null,
    onerror: null as ((e: Event) => void) | null,
    onmessage: null as ((e: MessageEvent) => void) | null,
    send: vi.fn(),
    close: vi.fn(function (this: typeof ws) {
      if (this.onclose) this.onclose(new CloseEvent('close'))
    }),
  }
  return ws
}

const MockWebSocket = vi.fn(function WebSocket() {
  lastWs = makeFakeWs()
  return lastWs
})

beforeEach(() => {
  MockWebSocket.mockClear()
  lastWs = makeFakeWs() // initialise so tests can safely reference it
  vi.stubGlobal('WebSocket', MockWebSocket)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

import { connectWebSocket, disconnectWebSocket } from '../webSocketHandler'
import type * as THREE from 'three'

const makeScene = () => ({
  add: vi.fn(),
  remove: vi.fn(),
}) as unknown as THREE.Scene

const noop = vi.fn()

// ---------------------------------------------------------------------------

describe('disconnectWebSocket', () => {
  // Regression: account switch left old socket alive and auto-reconnecting as the previous player
  // Bug: connectWebSocket had no disconnectWebSocket — the old socket's onclose kept triggering
  //      reconnects with stale playerId/token after switching accounts.
  it('does not trigger auto-reconnect when called before close fires', () => {
    connectWebSocket('player-1', 'token-a', makeScene(), noop)
    const wsAfterConnect = lastWs

    disconnectWebSocket()

    // Advance timers — no reconnect attempt should occur
    vi.advanceTimersByTime(10_000)
    // WebSocket constructor called exactly once (the initial connect), not again after disconnect
    expect(MockWebSocket).toHaveBeenCalledTimes(1)
    // onclose was nullified so auto-reconnect cannot fire
    expect(wsAfterConnect.onclose).toBeNull()
  })

  it('closes the underlying socket', () => {
    connectWebSocket('player-1', 'token-a', makeScene(), noop)
    const ws = lastWs
    disconnectWebSocket()
    expect(ws.close).toHaveBeenCalledOnce()
  })

  it('is safe to call when no socket is open', () => {
    expect(() => disconnectWebSocket()).not.toThrow()
  })
})

// ---------------------------------------------------------------------------

describe('connectWebSocket', () => {
  it('disconnects any existing socket before creating a new one', () => {
    connectWebSocket('player-1', 'token-a', makeScene(), noop)
    const firstWs = lastWs

    connectWebSocket('player-2', 'token-b', makeScene(), noop)

    // First socket must have been closed
    expect(firstWs.close).toHaveBeenCalledOnce()
    // And its onclose was nullified before close — no extra reconnect timer
    vi.advanceTimersByTime(10_000)
    expect(MockWebSocket).toHaveBeenCalledTimes(2)
  })
})
