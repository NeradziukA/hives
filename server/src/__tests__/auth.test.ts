import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { WebSocket } from 'ws'
import express from 'express'
import http from 'http'
import type { AddressInfo } from 'net'
import { setupWebSocket } from '../websocket'
import authRouter from '../routers/auth'
import { signAccess } from '../auth/jwt'

vi.mock('../db/queries', async (importOriginal) => {
  const bcrypt = await import('bcryptjs')
  const hash = await bcrypt.hash('secret', 10)
  const original = await importOriginal<typeof import('../db/queries')>()
  return {
    ...original,
    verifyPlayerCredentials: async (username: string, password: string) => {
      if (username === 'testuser') {
        const ok = await bcrypt.compare(password, hash)
        return ok ? { id: 'test-uuid-1234' } : null
      }
      return null
    },
    findPlayerById: async (id: string) => {
      if (id === 'test-uuid-1234') {
        return { id, unitType: 'HUMAN_A', lastLat: null, lastLng: null }
      }
      return null
    },
    handlePositionUpdate: vi.fn().mockResolvedValue(undefined),
    clearPositionBuffer: vi.fn(),
  }
})

// --- Unit tests: verifyPlayerCredentials ---

describe('verifyPlayerCredentials (unit)', () => {
  it('returns { id } for valid credentials', async () => {
    const { verifyPlayerCredentials } = await import('../db/queries')
    const result = await verifyPlayerCredentials('testuser', 'secret')
    expect(result).toEqual({ id: 'test-uuid-1234' })
  })

  it('returns null for wrong password', async () => {
    const { verifyPlayerCredentials } = await import('../db/queries')
    const result = await verifyPlayerCredentials('testuser', 'wrongpass')
    expect(result).toBeNull()
  })

  it('returns null for unknown username', async () => {
    const { verifyPlayerCredentials } = await import('../db/queries')
    const result = await verifyPlayerCredentials('nobody', 'secret')
    expect(result).toBeNull()
  })
})

// --- Integration tests: HTTP ---

let server: http.Server
let baseUrl: string
let wsUrl: string

beforeAll(async () => {
  const app = express()
  app.use(express.json())
  app.use('/api', authRouter)
  server = http.createServer(app)
  setupWebSocket(server)
  await new Promise<void>(resolve => server.listen(0, resolve))
  const port = (server.address() as AddressInfo).port
  baseUrl = `http://localhost:${port}`
  wsUrl = `ws://localhost:${port}`
})

afterAll(() => new Promise<void>((resolve, reject) =>
  server.close(err => err ? reject(err) : resolve())
))

describe('POST /api/login', () => {
  it('returns 200 with tokens for valid credentials', async () => {
    const res = await request(baseUrl)
      .post('/api/login')
      .send({ username: 'testuser', password: 'secret' })
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('test-uuid-1234')
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.refreshToken).toBeTruthy()
  })

  it('returns 401 for wrong password', async () => {
    const res = await request(baseUrl)
      .post('/api/login')
      .send({ username: 'testuser', password: 'wrong' })
    expect(res.status).toBe(401)
  })

  it('returns 400 when fields are missing', async () => {
    const res = await request(baseUrl)
      .post('/api/login')
      .send({ username: 'testuser' })
    expect(res.status).toBe(400)
  })
})

// --- Integration tests: WebSocket UNIT_AUTH ---

describe('WebSocket UNIT_AUTH flow', () => {
  it('authenticates with valid token and receives UNIT_AUTHENTICATED', async () => {
    const token = signAccess('test-uuid-1234', 'testuser')
    const ws = new WebSocket(wsUrl)
    await new Promise<void>(resolve => ws.once('open', resolve))
    ws.send(JSON.stringify({ type: 'UNIT_AUTH', srcId: 'test-uuid-1234', token }))
    const msg = await new Promise<{ type: string; srcId?: string }>(resolve =>
      ws.once('message', data => resolve(JSON.parse(data.toString())))
    )
    expect(msg.type).toBe('UNIT_AUTHENTICATED')
    expect(msg.srcId).toBe('test-uuid-1234')
    ws.close()
  })

  it('sends AUTH_ERROR when no token provided', async () => {
    const ws = new WebSocket(wsUrl)
    await new Promise<void>(resolve => ws.once('open', resolve))
    ws.send(JSON.stringify({ type: 'UNIT_AUTH', srcId: 'test-uuid-1234' }))
    const msg = await new Promise<{ type: string; payload?: { error: string } }>(resolve =>
      ws.once('message', data => resolve(JSON.parse(data.toString())))
    )
    expect(msg.type).toBe('AUTH_ERROR')
    expect(msg.payload?.error).toBe('Token required')
    await new Promise<void>(resolve => ws.once('close', resolve))
  })

  it('sends AUTH_ERROR for invalid token', async () => {
    const ws = new WebSocket(wsUrl)
    await new Promise<void>(resolve => ws.once('open', resolve))
    ws.send(JSON.stringify({ type: 'UNIT_AUTH', srcId: 'test-uuid-1234', token: 'not-a-valid-jwt' }))
    const msg = await new Promise<{ type: string; payload?: { error: string } }>(resolve =>
      ws.once('message', data => resolve(JSON.parse(data.toString())))
    )
    expect(msg.type).toBe('AUTH_ERROR')
    expect(msg.payload?.error).toBe('Invalid or expired token')
    await new Promise<void>(resolve => ws.once('close', resolve))
  })

  it('sends AUTH_ERROR for valid token with unknown player id', async () => {
    const token = signAccess('unknown-player', 'ghost')
    const ws = new WebSocket(wsUrl)
    await new Promise<void>(resolve => ws.once('open', resolve))
    ws.send(JSON.stringify({ type: 'UNIT_AUTH', srcId: 'unknown-player', token }))
    const msg = await new Promise<{ type: string; payload?: { error: string } }>(resolve =>
      ws.once('message', data => resolve(JSON.parse(data.toString())))
    )
    expect(msg.type).toBe('AUTH_ERROR')
    expect(msg.payload?.error).toBe('Unknown player')
    await new Promise<void>(resolve => ws.once('close', resolve))
  })

  it('closes connection when non-auth message type is sent first', async () => {
    const ws = new WebSocket(wsUrl)
    await new Promise<void>(resolve => ws.once('open', resolve))
    ws.send(JSON.stringify({ type: 'UNIT_MOVED', srcId: 'x' }))
    await new Promise<void>(resolve => ws.once('close', resolve))
    expect(ws.readyState).toBe(WebSocket.CLOSED)
  })
})
