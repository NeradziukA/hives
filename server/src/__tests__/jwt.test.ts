import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import {
  signAccess,
  signRefresh,
  verifyAccess,
  verifyRefresh,
} from '../auth/jwt'

const ACCESS_SECRET = 'dev-access-secret'
const REFRESH_SECRET = 'dev-refresh-secret'

describe('signAccess', () => {
  it('returns a non-empty JWT string', () => {
    const token = signAccess('user-1', 'alice')
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('embeds id and username in the payload', () => {
    const token = signAccess('user-1', 'alice')
    const decoded = jwt.decode(token) as Record<string, unknown>
    expect(decoded.id).toBe('user-1')
    expect(decoded.username).toBe('alice')
  })
})

describe('verifyAccess', () => {
  it('returns payload for a valid token', () => {
    const token = signAccess('user-1', 'alice')
    const payload = verifyAccess(token)
    expect(payload).not.toBeNull()
    expect(payload?.id).toBe('user-1')
    expect(payload?.username).toBe('alice')
  })

  it('returns null for a garbage string', () => {
    expect(verifyAccess('not.a.token')).toBeNull()
  })

  it('returns null for a token signed with a wrong secret', () => {
    const token = jwt.sign({ id: 'x', username: 'x' }, 'wrong-secret', { expiresIn: '1m' })
    expect(verifyAccess(token)).toBeNull()
  })

  it('returns null for an expired token', () => {
    const token = jwt.sign({ id: 'x', username: 'x' }, ACCESS_SECRET, { expiresIn: -1 })
    expect(verifyAccess(token)).toBeNull()
  })
})

describe('signRefresh', () => {
  it('returns a non-empty JWT string', () => {
    const token = signRefresh('user-1')
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('embeds id in the payload', () => {
    const token = signRefresh('user-1')
    const decoded = jwt.decode(token) as Record<string, unknown>
    expect(decoded.id).toBe('user-1')
  })

  it('access and refresh tokens use different secrets', () => {
    const refresh = signRefresh('user-1')
    // A refresh token must not be accepted as an access token
    expect(verifyAccess(refresh)).toBeNull()
  })
})

describe('verifyRefresh', () => {
  it('returns payload for a valid token', () => {
    const token = signRefresh('user-1')
    const payload = verifyRefresh(token)
    expect(payload).not.toBeNull()
    expect(payload?.id).toBe('user-1')
  })

  it('returns null for a garbage string', () => {
    expect(verifyRefresh('not.a.token')).toBeNull()
  })

  it('returns null for a token signed with a wrong secret', () => {
    const token = jwt.sign({ id: 'x' }, 'wrong-secret', { expiresIn: '7d' })
    expect(verifyRefresh(token)).toBeNull()
  })

  it('returns null for an expired token', () => {
    const token = jwt.sign({ id: 'x' }, REFRESH_SECRET, { expiresIn: -1 })
    expect(verifyRefresh(token)).toBeNull()
  })

  it('access token must not be accepted as refresh token', () => {
    const access = signAccess('user-1', 'alice')
    expect(verifyRefresh(access)).toBeNull()
  })
})
