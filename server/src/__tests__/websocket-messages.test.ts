import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { WebSocket } from 'ws'
import express from 'express'
import http from 'http'
import type { AddressInfo } from 'net'
import { setupWebSocket } from '../websocket'
import { signAccess } from '../auth/jwt'

vi.mock('../db/queries', async (importOriginal) => {
  const original = await importOriginal<typeof import('../db/queries')>()
  return {
    ...original,
    findPlayerById: async (id: string) => {
      const players: Record<string, object> = {
        'player-a': { id: 'player-a', unitType: 'HUMAN_A', lastLat: 10, lastLng: 20 },
        'player-b': { id: 'player-b', unitType: 'HUMAN_A', lastLat: 11, lastLng: 21 },
      }
      return players[id] ?? null
    },
    handlePositionUpdate: vi.fn().mockResolvedValue(undefined),
    clearPositionBuffer: vi.fn(),
  }
})

vi.mock('../api', () => ({
  getStaticObjects: vi.fn().mockResolvedValue([
    { id: 'obj-1', type: 'builbing-a', coords: { lat: 55.0, lon: 37.0 } },
  ]),
}))

let server: http.Server
let wsUrl: string

beforeAll(async () => {
  const app = express()
  server = http.createServer(app)
  setupWebSocket(server)
  await new Promise<void>(resolve => server.listen(0, resolve))
  const port = (server.address() as AddressInfo).port
  wsUrl = `ws://localhost:${port}`
})

afterAll(() => new Promise<void>((resolve, reject) =>
  server.close(err => err ? reject(err) : resolve())
))

/** Helper: connect and authenticate a WebSocket client, returns the socket. */
async function connectAndAuth(playerId: string): Promise<WebSocket> {
  const token = signAccess(playerId, playerId)
  const ws = new WebSocket(wsUrl)
  await new Promise<void>(resolve => ws.once('open', resolve))
  ws.send(JSON.stringify({ type: 'UNIT_AUTH', srcId: playerId, token }))
  // Wait for UNIT_AUTHENTICATED
  await new Promise<void>((resolve, reject) => {
    ws.once('message', (data) => {
      const msg = JSON.parse(data.toString())
      if (msg.type === 'UNIT_AUTHENTICATED') resolve()
      else reject(new Error(`Expected UNIT_AUTHENTICATED, got ${msg.type}`))
    })
  })
  return ws
}

describe('WebSocket post-authentication messages', () => {
  it('UNIT_GET_ALL returns INIT_UNITS with users and staticObjects', async () => {
    const ws = await connectAndAuth('player-a')

    ws.send(JSON.stringify({ type: 'UNIT_GET_ALL', srcId: 'player-a', payload: { coords: { lat: 10, lon: 20 } } }))

    const msg = await new Promise<{ type: string; payload: { users: object; staticObjects: object[] } }>(resolve =>
      ws.once('message', data => resolve(JSON.parse(data.toString())))
    )

    expect(msg.type).toBe('INIT_UNITS')
    expect(msg.payload.users).toBeDefined()
    expect(Array.isArray(msg.payload.staticObjects)).toBe(true)
    expect(msg.payload.staticObjects).toHaveLength(1)
    ws.close()
  })

  it('UNIT_MOVED is broadcast to other connected clients', async () => {
    const wsA = await connectAndAuth('player-a')
    const wsB = await connectAndAuth('player-b')

    // Drain UNIT_CONNECTED notification that B receives when A is already connected
    // and the one A receives when B connects
    const drainOneMessage = (ws: WebSocket) =>
      new Promise<void>(resolve => ws.once('message', () => resolve()))

    // B should receive UNIT_CONNECTED for A (already authenticated before B joined)
    // Actually on B auth, A receives UNIT_CONNECTED for B
    await drainOneMessage(wsA)

    wsA.send(JSON.stringify({
      type: 'UNIT_MOVED',
      srcId: 'player-a',
      payload: { coords: { lat: 55.1, lon: 37.1 } },
    }))

    const msg = await new Promise<{ type: string; srcId: string; payload: { coords: { lat: number; lon: number } } }>(resolve =>
      wsB.once('message', data => resolve(JSON.parse(data.toString())))
    )

    expect(msg.type).toBe('UNIT_MOVED')
    expect(msg.srcId).toBe('player-a')
    expect(msg.payload.coords.lat).toBeCloseTo(55.1)
    expect(msg.payload.coords.lon).toBeCloseTo(37.1)

    wsA.close()
    wsB.close()
  })

  it('UNIT_DISCONNECTED is broadcast when a client disconnects', async () => {
    const wsA = await connectAndAuth('player-a')
    const wsB = await connectAndAuth('player-b')

    // Drain the UNIT_CONNECTED notification A gets when B joins
    await new Promise<void>(resolve => wsA.once('message', () => resolve()))

    wsB.close()

    const msg = await new Promise<{ type: string; srcId: string }>(resolve =>
      wsA.once('message', data => resolve(JSON.parse(data.toString())))
    )

    expect(msg.type).toBe('UNIT_DISCONNECTED')
    expect(msg.srcId).toBe('player-b')

    wsA.close()
  })

  it('invalid JSON after auth is silently ignored (no crash)', async () => {
    const ws = await connectAndAuth('player-a')
    ws.send('this is not json')
    // Give the server a tick to handle it
    await new Promise(resolve => setTimeout(resolve, 50))
    expect(ws.readyState).toBe(WebSocket.OPEN)
    ws.close()
  })
})
