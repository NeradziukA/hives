import { describe, it, expect, vi, beforeEach } from 'vitest'

// Track DB write calls via a mutable object hoisted before vi.mock
const calls = vi.hoisted(() => ({ update: 0, insert: 0 }))

vi.mock('../db/index', () => ({
  db: {
    update: () => ({
      set: () => ({
        where: () => {
          calls.update++
          return Promise.resolve()
        },
      }),
    }),
    insert: () => ({
      values: () => {
        calls.insert++
        return Promise.resolve()
      },
    }),
  },
}))

import { handlePositionUpdate, clearPositionBuffer } from '../db/queries'

beforeEach(() => {
  calls.update = 0
  calls.insert = 0
})

describe('handlePositionUpdate — position buffer logic', () => {
  it('writes to DB on the first call for a player', async () => {
    const id = 'buf-player-1'
    clearPositionBuffer(id)
    await handlePositionUpdate(id, 55.0, 37.0)
    expect(calls.update).toBe(1)
    expect(calls.insert).toBe(1)
  })

  it('does NOT write again within 30 s with the same hex', async () => {
    const id = 'buf-player-2'
    clearPositionBuffer(id)
    await handlePositionUpdate(id, 55.0, 37.0, 'hex-A')
    calls.update = 0
    calls.insert = 0

    await handlePositionUpdate(id, 55.001, 37.001, 'hex-A')
    expect(calls.update).toBe(0)
    expect(calls.insert).toBe(0)
  })

  it('writes again when the hex changes', async () => {
    const id = 'buf-player-3'
    clearPositionBuffer(id)
    await handlePositionUpdate(id, 55.0, 37.0, 'hex-A')
    calls.update = 0
    calls.insert = 0

    await handlePositionUpdate(id, 55.5, 37.5, 'hex-B')
    expect(calls.update).toBe(1)
    expect(calls.insert).toBe(1)
  })

  it('writes again after clearPositionBuffer resets the buffer', async () => {
    const id = 'buf-player-4'
    clearPositionBuffer(id)
    await handlePositionUpdate(id, 55.0, 37.0, 'hex-A')
    calls.update = 0
    calls.insert = 0

    clearPositionBuffer(id)
    await handlePositionUpdate(id, 55.0, 37.0, 'hex-A')
    expect(calls.update).toBe(1)
    expect(calls.insert).toBe(1)
  })

  it('buffers are independent per player id', async () => {
    const idA = 'buf-player-5a'
    const idB = 'buf-player-5b'
    clearPositionBuffer(idA)
    clearPositionBuffer(idB)

    await handlePositionUpdate(idA, 55.0, 37.0, 'hex-A')
    const afterA = calls.update

    await handlePositionUpdate(idB, 56.0, 38.0, 'hex-A')
    // Both first calls should write
    expect(calls.update).toBe(afterA + 1)
  })
})

describe('clearPositionBuffer', () => {
  it('is a no-op for an unknown player id (does not throw)', () => {
    expect(() => clearPositionBuffer('never-existed')).not.toThrow()
  })
})
