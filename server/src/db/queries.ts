import { eq, gt, and } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from './index'
import { players, staticObjects, playerTracks, hexVisited, combatEvents } from './schema'
import type { Player, CombatEvent } from './schema'
import { ObjectType, StaticObject } from '../types'

// --- Player ---

export async function findPlayerById(id: string): Promise<Player | null> {
  const rows = await db.select().from(players).where(eq(players.id, id)).limit(1)
  return rows[0] ?? null
}

export async function verifyPlayerCredentials(
  username: string,
  password: string,
): Promise<{ id: string } | null> {
  const rows = await db
    .select({ id: players.id, passwordHash: players.passwordHash })
    .from(players)
    .where(eq(players.username, username))
    .limit(1)
  if (rows.length === 0 || !rows[0].passwordHash) return null
  const match = await bcrypt.compare(password, rows[0].passwordHash)
  return match ? { id: rows[0].id } : null
}

export async function updatePlayerPosition(id: string, lat: number, lng: number): Promise<void> {
  await db
    .update(players)
    .set({ lastLat: lat, lastLng: lng, lastSeen: new Date() })
    .where(eq(players.id, id))
}

// --- Tracks ---

export async function recordTrackPoint(
  playerId: string,
  lat: number,
  lng: number,
  hexId?: string,
): Promise<void> {
  await db.insert(playerTracks).values({ playerId, lat, lng, hexId })
}

export async function getPlayerTrack(
  playerId: string,
  hoursBack = 24,
): Promise<typeof playerTracks.$inferSelect[]> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000)
  return db
    .select()
    .from(playerTracks)
    .where(and(eq(playerTracks.playerId, playerId), gt(playerTracks.recordedAt, since)))
    .orderBy(playerTracks.recordedAt)
}

// --- Hex visits ---

export async function markHexVisited(playerId: string, hexId: string): Promise<void> {
  await db
    .insert(hexVisited)
    .values({ playerId, hexId })
    .onConflictDoUpdate({
      target: [hexVisited.playerId, hexVisited.hexId],
      set: { lastVisit: new Date() },
    })
}

export async function getVisitedHexes(playerId: string): Promise<string[]> {
  const rows = await db
    .select({ hexId: hexVisited.hexId })
    .from(hexVisited)
    .where(eq(hexVisited.playerId, playerId))
  return rows.map(r => r.hexId)
}

// --- Static objects ---

export async function getAllStaticObjects(): Promise<StaticObject[]> {
  const rows = await db
    .select()
    .from(staticObjects)
    .where(eq(staticObjects.active, true))
  return rows.map(row => ({
    id: row.id,
    type: row.type as ObjectType,
    coords: {
      lat: row.lat,
      lon: row.lng,
    },
  }))
}

// --- Combat ---

export async function recordCombat(
  event: Omit<typeof combatEvents.$inferInsert, 'id' | 'occurredAt'>,
): Promise<CombatEvent> {
  const [created] = await db.insert(combatEvents).values(event).returning()
  return created
}

// --- Position buffer ---

interface BufferEntry {
  lastWritten: number
  lastHexId?: string
}

const positionBuffer = new Map<string, BufferEntry>()

export async function handlePositionUpdate(
  playerId: string,
  lat: number,
  lng: number,
  hexId?: string,
): Promise<void> {
  const now = Date.now()
  const buf = positionBuffer.get(playerId)
  const timeElapsed = !buf || now - buf.lastWritten > 30_000
  const hexChanged = hexId !== undefined && buf?.lastHexId !== hexId

  if (timeElapsed || hexChanged) {
    await updatePlayerPosition(playerId, lat, lng)
    await recordTrackPoint(playerId, lat, lng, hexId)
    positionBuffer.set(playerId, { lastWritten: now, lastHexId: hexId })
  }
}

export function clearPositionBuffer(playerId: string): void {
  positionBuffer.delete(playerId)
}
