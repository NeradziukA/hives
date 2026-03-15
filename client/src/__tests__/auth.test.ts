import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  setTokens,
  getAccessToken,
  getPlayerId,
  hasSession,
  clearSession,
  refreshAccessToken,
} from '../auth'

// jsdom provides localStorage — reset state before each test
beforeEach(() => {
  localStorage.clear()
  clearSession()
})

describe('setTokens', () => {
  it('stores accessToken in memory and refreshToken in localStorage', () => {
    setTokens('acc-123', 'ref-456', 'player-1')
    expect(getAccessToken()).toBe('acc-123')
    expect(localStorage.getItem('refreshToken')).toBe('ref-456')
    expect(localStorage.getItem('playerId')).toBe('player-1')
  })
})

describe('getAccessToken', () => {
  it('returns null before setTokens is called', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('returns the token set by setTokens', () => {
    setTokens('acc-abc', 'ref-abc', 'p1')
    expect(getAccessToken()).toBe('acc-abc')
  })

  it('returns null after clearSession', () => {
    setTokens('acc-abc', 'ref-abc', 'p1')
    clearSession()
    expect(getAccessToken()).toBeNull()
  })
})

describe('getPlayerId', () => {
  it('returns null when nothing is set', () => {
    expect(getPlayerId()).toBeNull()
  })

  it('returns id from memory after setTokens', () => {
    setTokens('a', 'r', 'player-99')
    expect(getPlayerId()).toBe('player-99')
  })

  it('falls back to localStorage when in-memory id is cleared', () => {
    localStorage.setItem('playerId', 'stored-player')
    expect(getPlayerId()).toBe('stored-player')
  })
})

describe('hasSession', () => {
  it('returns false when no refreshToken in localStorage', () => {
    expect(hasSession()).toBe(false)
  })

  it('returns true when refreshToken is in localStorage', () => {
    localStorage.setItem('refreshToken', 'some-refresh-token')
    expect(hasSession()).toBe(true)
  })

  it('returns false after clearSession removes the token', () => {
    setTokens('a', 'ref-xyz', 'p1')
    clearSession()
    expect(hasSession()).toBe(false)
  })
})

describe('clearSession', () => {
  it('removes all stored credentials', () => {
    setTokens('acc', 'ref', 'player-7')
    clearSession()
    expect(getAccessToken()).toBeNull()
    expect(getPlayerId()).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('playerId')).toBeNull()
  })
})

describe('refreshAccessToken', () => {
  it('returns false when no refreshToken is in localStorage', async () => {
    const result = await refreshAccessToken()
    expect(result).toBe(false)
  })

  it('returns true and updates accessToken on successful response', async () => {
    localStorage.setItem('refreshToken', 'valid-refresh')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: 'new-access-token', id: 'player-1' }),
    }))

    const result = await refreshAccessToken()
    expect(result).toBe(true)
    expect(getAccessToken()).toBe('new-access-token')

    vi.unstubAllGlobals()
  })

  it('returns false and clears session on non-ok response', async () => {
    localStorage.setItem('refreshToken', 'expired-refresh')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const result = await refreshAccessToken()
    expect(result).toBe(false)
    expect(hasSession()).toBe(false)

    vi.unstubAllGlobals()
  })

  it('returns false when fetch throws a network error', async () => {
    localStorage.setItem('refreshToken', 'some-refresh')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await refreshAccessToken()
    expect(result).toBe(false)

    vi.unstubAllGlobals()
  })
})
