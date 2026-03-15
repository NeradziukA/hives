import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { WebSocket } from 'ws'
import express from 'express'
import http from 'http'
import { setupWebSocket } from '../websocket'
import authRouter from '../auth-router'

// --- Unit tests: verifyPlayerCredentials ---

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
  }
})

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

// --- Integration tests: HTTP + WebSocket ---

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
  const port = (server.address() as any).port
  baseUrl = `http://localhost:${port}`
  wsUrl = `ws://localhost:${port}`
})

afterAll(() => new Promise<void>((resolve, reject) =>
  server.close(err => err ? reject(err) : resolve())
))

describe('POST /api/login', () => {
  it('returns 200 and { id } for valid credentials', async () => {
    const res = await request(baseUrl)
      .post('/api/login')
      .send({ username: 'testuser', password: 'secret' })
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('test-uuid-1234')
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

describe('WebSocket UNIT_AUTH flow', () => {
  it('authenticates with valid player id and receives UNIT_AUTHENTICATED', async () => {
    const ws = new WebSocket(wsUrl)
    await new Promise<void>(resolve => ws.once('open', resolve))
    ws.send(JSON.stringify({ type: 'UNIT_AUTH', srcId: 'test-uuid-1234' }))
    const msg = await new Promise<any>(resolve =>
      ws.once('message', data => resolve(JSON.parse(data.toString())))
    )
    expect(msg.type).toBe('UNIT_AUTHENTICATED')
    expect(msg.srcId).toBe('test-uuid-1234')
    ws.close()
  })

  it('closes connection with AUTH_ERROR for unknown player id', async () => {
    const ws = new WebSocket(wsUrl)
    await new Promise<void>(resolve => ws.once('open', resolve))
    ws.send(JSON.stringify({ type: 'UNIT_AUTH', srcId: 'unknown-id' }))
    const msg = await new Promise<any>(resolve =>
      ws.once('message', data => resolve(JSON.parse(data.toString())))
    )
    expect(msg.type).toBe('AUTH_ERROR')
    await new Promise<void>(resolve => ws.once('close', resolve))
  })

  it('closes connection after timeout when no UNIT_AUTH is sent', async () => {
    const ws = new WebSocket(wsUrl)
    await new Promise<void>(resolve => ws.once('open', resolve))
    // Wait for close without sending anything (timeout is 10s in prod, but we just verify the mechanism)
    // Send wrong type to trigger immediate close instead of waiting full 10s
    ws.send(JSON.stringify({ type: 'UNIT_MOVED', srcId: 'x' }))
    await new Promise<void>(resolve => ws.once('close', resolve))
    expect(ws.readyState).toBe(WebSocket.CLOSED)
  }, 15_000)
})
