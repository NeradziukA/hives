import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import http from 'http'
import type { AddressInfo } from 'net'
import { signRefresh } from '../auth/jwt'
import authRouter from '../auth-router'

vi.mock('../db/queries', async (importOriginal) => {
  const original = await importOriginal<typeof import('../db/queries')>()
  return {
    ...original,
    verifyPlayerCredentials: vi.fn(),
    findPlayerById: async (id: string) => {
      if (id === 'known-player') {
        return { id, username: 'alice', unitType: 'HUMAN_A', lastLat: null, lastLng: null }
      }
      return null
    },
  }
})

let server: http.Server
let baseUrl: string

beforeAll(async () => {
  const app = express()
  app.use(express.json())
  app.use('/api', authRouter)
  server = http.createServer(app)
  await new Promise<void>(resolve => server.listen(0, resolve))
  const port = (server.address() as AddressInfo).port
  baseUrl = `http://localhost:${port}`
})

afterAll(() => new Promise<void>((resolve, reject) =>
  server.close(err => err ? reject(err) : resolve())
))

describe('POST /api/refresh', () => {
  it('returns 400 when refreshToken is missing', async () => {
    const res = await request(baseUrl).post('/api/refresh').send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/refreshToken/)
  })

  it('returns 401 for an invalid refresh token string', async () => {
    const res = await request(baseUrl)
      .post('/api/refresh')
      .send({ refreshToken: 'not-a-valid-token' })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/Invalid/)
  })

  it('returns 401 for a valid token but unknown player id', async () => {
    const token = signRefresh('no-such-player')
    const res = await request(baseUrl)
      .post('/api/refresh')
      .send({ refreshToken: token })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/not found/i)
  })

  it('returns 200 with new accessToken for valid token and known player', async () => {
    const token = signRefresh('known-player')
    const res = await request(baseUrl)
      .post('/api/refresh')
      .send({ refreshToken: token })
    expect(res.status).toBe(200)
    expect(res.body.accessToken).toBeTruthy()
    expect(res.body.id).toBe('known-player')
  })

  it('returned accessToken is a valid JWT', async () => {
    const token = signRefresh('known-player')
    const res = await request(baseUrl)
      .post('/api/refresh')
      .send({ refreshToken: token })
    const parts = res.body.accessToken.split('.')
    expect(parts).toHaveLength(3)
  })
})
