/**
 * NPC Patrol Loop
 *
 * Manages all server-controlled NPC units: both patrol bots that follow waypoints
 * and stationary always-online NPCs (quest masters, bosses, etc.).
 *
 * ## Startup
 * `startNpcLoop()` must be called once after the WebSocket server is ready.
 * It loads all active patrols and always-online NPCs from the database, registers
 * them in the shared `users` map so they appear in `INIT_UNITS` responses, then
 * starts the recurring tick.
 *
 * ## Tick cycle (every NPC_TICK_INTERVAL_MS)
 * Each tick iterates over every active patrol state and:
 *   1. Computes how many meters the NPC travels this tick  (speed × elapsed seconds).
 *   2. Advances the NPC along its waypoint chain, looping when the last waypoint
 *      is reached.  A single tick may cross multiple waypoints if the step is large.
 *   3. Updates the NPC's position in the shared `users` map via `setNpcPosition()`.
 *   4. Broadcasts a `UNIT_MOVED` message so connected clients receive the new coords.
 *   5. Persists the new lat/lng to the database so the server can resume from the
 *      correct position after a restart.
 *
 * ## Extensibility
 * All patrol states are kept in the `patrolStates` Map.  Future patrol types
 * (e.g. vehicle patrols, flying units, formation patrols) only need to populate
 * this map and the existing tick loop will drive them automatically.
 *
 * ## Always-online stationary NPCs
 * NPCs with `alwaysOnline = true` but without an active patrol are registered in the
 * `users` map at startup and never removed.  Their position is read from the database
 * and does not change during the tick (they have no waypoints to follow).
 */

import { MessageType, UnitType } from '../types'
import { getActivePatrols, getAlwaysOnlineNpcs, updatePlayerPosition } from '../db/queries'
import { registerNpc, setNpcPosition, broadcast } from '../websocket/handlers/connect'
import { NPC_TICK_INTERVAL_MS } from '../config'
import { logger } from '../logger'

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

interface PatrolState {
  /** UUID of the npc_patrols row */
  patrolId: string
  /** Player id of the NPC unit */
  npcId: string
  unitType: UnitType
  /** Movement speed in metres per second */
  speed: number
  /** Waypoints sorted ascending by `order` */
  waypoints: Array<{ lat: number; lng: number; order: number }>
  /** Index into `waypoints` of the current target */
  currentWaypointIndex: number
  /** Current position (updated in-memory every tick) */
  currentLat: number
  currentLng: number
}

/**
 * All active patrol states, keyed by npcId.
 * Add entries here to bring more patrols into the tick loop at runtime.
 */
const patrolStates = new Map<string, PatrolState>()

// ---------------------------------------------------------------------------
// Geodesic helpers
// ---------------------------------------------------------------------------

const EARTH_RADIUS_M = 6_371_000

/** Haversine distance between two lat/lng points, in metres. */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Move `distanceM` metres from (lat1, lng1) toward (lat2, lng2).
 * Returns the new position.  If the distance to the target is less than
 * `distanceM`, the target position is returned unchanged (caller must
 * advance the waypoint index).
 */
function moveToward(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
  distanceM: number,
): { lat: number; lng: number } {
  const φ1 = (lat1 * Math.PI) / 180
  const λ1 = (lng1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const λ2 = (lng2 * Math.PI) / 180

  // Bearing from point 1 → point 2
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1)
  const bearing = Math.atan2(y, x)

  const δ = distanceM / EARTH_RADIUS_M // angular distance

  const φ3 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) +
    Math.cos(φ1) * Math.sin(δ) * Math.cos(bearing),
  )
  const λ3 =
    λ1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ3),
    )

  return {
    lat: (φ3 * 180) / Math.PI,
    lng: (λ3 * 180) / Math.PI,
  }
}

// ---------------------------------------------------------------------------
// Waypoint traversal
// ---------------------------------------------------------------------------

/**
 * Advance a patrol's position by `stepM` metres along its waypoint chain.
 * Mutates the state in-place and returns the final position.
 *
 * The loop handles the case where a single step spans multiple short segments
 * (unusual in practice but correct by design).  The patrol loops back to
 * waypoint 0 after the last waypoint.
 */
function advancePatrol(state: PatrolState, stepM: number): { lat: number; lng: number } {
  const { waypoints } = state
  if (waypoints.length === 0) return { lat: state.currentLat, lng: state.currentLng }

  let remaining = stepM
  let lat = state.currentLat
  let lng = state.currentLng

  // Guard against infinite loop in degenerate waypoint sets
  const maxIterations = waypoints.length + 1
  let iterations = 0

  while (remaining > 0 && iterations < maxIterations) {
    iterations++
    const target = waypoints[state.currentWaypointIndex]
    const dist = haversineDistance(lat, lng, target.lat, target.lng)

    if (dist <= remaining) {
      // Reach this waypoint; consume the distance and advance to the next one
      remaining -= dist
      lat = target.lat
      lng = target.lng
      state.currentWaypointIndex = (state.currentWaypointIndex + 1) % waypoints.length
    } else {
      // Move partway toward the target
      const pos = moveToward(lat, lng, target.lat, target.lng, remaining)
      lat = pos.lat
      lng = pos.lng
      remaining = 0
    }
  }

  state.currentLat = lat
  state.currentLng = lng
  return { lat, lng }
}

// ---------------------------------------------------------------------------
// Startup: load from database
// ---------------------------------------------------------------------------

/**
 * Load all active NPC patrols from the database and populate `patrolStates`.
 * Returns the list of npcIds that were registered so always-online stationary
 * NPCs can be excluded from a duplicate load.
 */
async function loadPatrols(): Promise<string[]> {
  const rows = await getActivePatrols()
  const registeredIds: string[] = []

  for (const row of rows) {
    const sorted = [...row.waypoints].sort((a, b) => a.order - b.order)

    // Determine closest waypoint to resume from after a server restart
    let startIndex = 0
    if (row.lastLat !== null && row.lastLng !== null && sorted.length > 0) {
      let minDist = Infinity
      sorted.forEach((wp, i) => {
        const d = haversineDistance(row.lastLat!, row.lastLng!, wp.lat, wp.lng)
        if (d < minDist) { minDist = d; startIndex = i }
      })
    }

    const state: PatrolState = {
      patrolId:             row.patrolId,
      npcId:                row.npcId,
      unitType:             row.unitType,
      speed:                row.speed,
      waypoints:            sorted,
      currentWaypointIndex: startIndex,
      currentLat:           row.lastLat ?? (sorted[0]?.lat ?? 0),
      currentLng:           row.lastLng ?? (sorted[0]?.lng ?? 0),
    }

    patrolStates.set(row.npcId, state)

    registerNpc(row.npcId, {
      id:     row.npcId,
      type:   row.unitType,
      coords: { lat: state.currentLat, lon: state.currentLng },
    })

    registeredIds.push(row.npcId)
    logger.info(`NPC patrol registered: ${row.npcId} (${row.unitType}), waypoints: ${sorted.length}`)
  }

  return registeredIds
}

/**
 * Load stationary always-online NPCs (those without an active patrol).
 * They appear in `INIT_UNITS` but are never moved by the tick loop.
 */
async function loadStaticNpcs(excludeIds: string[]): Promise<void> {
  const rows = await getAlwaysOnlineNpcs(excludeIds)

  for (const row of rows) {
    registerNpc(row.id, {
      id:     row.id,
      type:   row.unitType,
      coords: { lat: row.lastLat ?? 0, lon: row.lastLng ?? 0 },
    })
    logger.info(`NPC always-online registered: ${row.id} (${row.unitType})`)
  }
}

// ---------------------------------------------------------------------------
// Tick
// ---------------------------------------------------------------------------

/**
 * Single tick: advance every patrol by one time-step and broadcast the result.
 * Designed to be called on a fixed interval; `elapsedMs` is the actual elapsed
 * time so the motion stays accurate even if the timer drifts.
 */
async function tick(elapsedMs: number): Promise<void> {
  const elapsedS = elapsedMs / 1_000

  const updates: Promise<void>[] = []

  for (const [npcId, state] of patrolStates) {
    const stepM = state.speed * elapsedS
    const { lat, lng } = advancePatrol(state, stepM)

    setNpcPosition(npcId, { lat, lon: lng })

    broadcast({
      type:    MessageType.UNIT_MOVED,
      srcId:   npcId,
      payload: { coords: { lat, lon: lng } },
    })

    // Persist position to DB (allows resuming from last known position on restart)
    updates.push(
      updatePlayerPosition(npcId, lat, lng).catch(err => {
        logger.error(`Failed to persist NPC position for ${npcId}: ${err}`)
      }),
    )
  }

  await Promise.all(updates)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise the NPC subsystem and start the patrol tick loop.
 *
 * Call once from `server/src/index.ts` after the HTTP/WebSocket server is ready.
 * The loop runs for the lifetime of the process; there is no stop mechanism
 * because NPCs should always be online.
 */
/**
 * Update the in-memory speed for a patrol identified by its `patrolId` (UUID
 * of the `npc_patrols` row).  Call this immediately after persisting a speed
 * change to the database so the running tick loop picks it up without a restart.
 */
export function applyPatrolSpeed(patrolId: string, speed: number): void {
  for (const state of patrolStates.values()) {
    if (state.patrolId === patrolId) {
      state.speed = speed
      logger.info(`NPC patrol speed updated in-memory: ${state.npcId} → ${speed} m/s`)
      return
    }
  }
}

export async function startNpcLoop(): Promise<void> {
  logger.info('NPC loop: initialising…')

  const patrolIds = await loadPatrols()
  await loadStaticNpcs(patrolIds)

  logger.info(
    `NPC loop: ${patrolStates.size} patrol(s), tick every ${NPC_TICK_INTERVAL_MS} ms`,
  )

  let lastTick = Date.now()

  setInterval(async () => {
    const now = Date.now()
    const elapsed = now - lastTick
    lastTick = now

    try {
      await tick(elapsed)
    } catch (err) {
      logger.error('NPC tick error: ' + err)
    }
  }, NPC_TICK_INTERVAL_MS)
}
