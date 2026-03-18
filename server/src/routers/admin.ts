import path from "path";
import { Router, Request, Response, NextFunction } from "express";
import { eq, ilike, or, and, gte, lte, count, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { players, staticObjects, npcPatrols } from "../db/schema";
import { BuildingType } from "../types";
import { verifyAccess } from "../auth/jwt";
import { getOnlineIds, isOnline } from "../websocket/handlers/connect";

const router = Router();

// ── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyAccess(auth.slice(7));
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  next();
}

// ── Serve admin SPA ──────────────────────────────────────────────────────────

router.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "..", "static", "admin", "index.html"));
});

// ── API – all routes below require auth ─────────────────────────────────────

const api = Router();
api.use(requireAuth);

// GET /admin/api/users?page=1&limit=20&q=&lat=&lng=&radius=
api.get("/users", async (req: Request, res: Response) => {
  const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;

  const q      = (req.query.q as string | undefined)?.trim();
  const lat    = parseFloat(req.query.lat    as string);
  const lng    = parseFloat(req.query.lng    as string);
  const radius = parseFloat(req.query.radius as string); // km
  const onlineOnly = req.query.online === "true";

  const filters = [];

  if (q) {
    filters.push(or(ilike(players.username, `%${q}%`), eq(players.id, q)));
  }

  if (onlineOnly) {
    const onlineIds = getOnlineIds();
    filters.push(onlineIds.length > 0 ? inArray(players.id, onlineIds) : eq(players.id, ""));
  }

  if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius) && radius > 0) {
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));
    filters.push(
      and(
        gte(players.lastLat, lat - latDelta),
        lte(players.lastLat, lat + latDelta),
        gte(players.lastLng, lng - lngDelta),
        lte(players.lastLng, lng + lngDelta),
      ),
    );
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [rows, totals] = await Promise.all([
    db
      .select({
        id:        players.id,
        username:  players.username,
        unitType:  players.unitType,
        faction:   players.faction,
        rank:      players.rank,
        role:      players.role,
        isAlive:   players.isAlive,
        lastLat:   players.lastLat,
        lastLng:   players.lastLng,
        lastSeen:  players.lastSeen,
        createdAt: players.createdAt,
      })
      .from(players)
      .where(whereClause)
      .orderBy(players.createdAt)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(players).where(whereClause),
  ]);

  const enriched = rows.map(r => ({ ...r, isOnline: isOnline(r.id) }));
  res.json({ users: enriched, total: totals[0]?.total ?? 0, page, limit });
});

// GET /admin/api/users/:id
api.get("/users/:id", async (req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(players)
    .where(eq(players.id, req.params.id as string))
    .limit(1);

  if (!rows[0]) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  const { passwordHash: _, ...safe } = rows[0];
  res.json({ ...safe, isOnline: isOnline(safe.id) });
});

// POST /admin/api/users
api.post("/users", async (req: Request, res: Response) => {
  const { username, password, ...rest } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = uuidv4();

  try {
    const [created] = await db
      .insert(players)
      .values({
        id,
        username,
        passwordHash,
        unitType:     rest.unitType     ?? "HUMAN_A",
        faction:      rest.faction      ?? "humans",
        rank:         rest.rank         ?? "novice",
        role:         rest.role         ?? null,
        strength:     rest.strength     ?? 10,
        defense:      rest.defense      ?? 10,
        agility:      rest.agility      ?? 10,
        speed:        rest.speed        ?? 10,
        intelligence: rest.intelligence ?? 10,
        hp:           rest.hp           ?? 100,
        maxHp:        rest.maxHp        ?? 100,
        leadership:   rest.leadership   ?? 0,
        vision:       rest.vision       ?? 10,
        vaccineLevel: rest.vaccineLevel ?? 0,
        bagSize:      rest.bagSize      ?? 5,
        heavyWeapon:  rest.heavyWeapon  ?? 0,
        twoHanded:    rest.twoHanded    ?? 0,
        camouflage:   rest.camouflage   ?? 0,
        regeneration: rest.regeneration ?? 0,
        stench:       rest.stench       ?? 0,
        mutation:     rest.mutation     ?? 0,
        isAlive:      rest.isAlive      ?? true,
      })
      .returning();

    const { passwordHash: _ph, ...safe } = created;
    res.status(201).json(safe);
  } catch (e: unknown) {
    const pg = e as { code?: string };
    if (pg?.code === "23505") {
      res.status(409).json({ error: "Username already exists" });
    } else {
      throw e;
    }
  }
});

// PUT /admin/api/users/:id
api.put("/users/:id", async (req: Request, res: Response) => {
  const { password, passwordHash: _ph, id: _id, createdAt: _ca, ...rest } = req.body ?? {};

  const updates: Record<string, unknown> = { ...rest };
  if (password) {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }

  const rows = await db
    .update(players)
    .set(updates)
    .where(eq(players.id, req.params.id as string))
    .returning();

  if (rows.length === 0) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  const { passwordHash: _, ...safe } = rows[0];
  res.json(safe);
});

// DELETE /admin/api/users/:id
api.delete("/users/:id", async (req: Request, res: Response) => {
  const rows = await db
    .delete(players)
    .where(eq(players.id, req.params.id as string))
    .returning({ id: players.id });

  if (rows.length === 0) {
    res.status(404).json({ error: "Player not found" });
    return;
  }

  res.json({ success: true });
});

// GET /admin/api/buildings?q=&active=&page=1&limit=20
api.get("/buildings", async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  const q      = (req.query.q as string | undefined)?.trim();
  const active = req.query.active;

  const filters = [];
  if (q) filters.push(or(ilike(staticObjects.name, `%${q}%`), ilike(staticObjects.type, `%${q}%`), eq(staticObjects.id, q)));
  if (active === "true")  filters.push(eq(staticObjects.active, true));
  if (active === "false") filters.push(eq(staticObjects.active, false));

  const where = filters.length > 0 ? and(...filters) : undefined;
  const [rows, totals] = await Promise.all([
    db.select().from(staticObjects).where(where).orderBy(staticObjects.type).limit(limit).offset(offset),
    db.select({ total: count() }).from(staticObjects).where(where),
  ]);
  res.json({ buildings: rows, total: totals[0]?.total ?? 0, page, limit });
});

// POST /admin/api/buildings
api.post("/buildings", async (req: Request, res: Response) => {
  const { type, name, lat, lng, revealRadius, faction, active } = req.body ?? {};
  const validTypes = Object.values(BuildingType);
  if (!type || lat == null || lng == null || revealRadius == null) {
    res.status(400).json({ error: "type, lat, lng and revealRadius are required" });
    return;
  }
  if (!validTypes.includes(type)) {
    res.status(400).json({ error: `Invalid type. Valid values: ${validTypes.join(", ")}` });
    return;
  }
  const id = uuidv4();
  const [created] = await db.insert(staticObjects).values({
    id, type, name: name || null,
    lat: parseFloat(lat), lng: parseFloat(lng),
    revealRadius: parseInt(revealRadius),
    faction: faction || null,
    active: active ?? true,
  }).returning();
  res.status(201).json(created);
});

// PUT /admin/api/buildings/:id
api.put("/buildings/:id", async (req: Request, res: Response) => {
  const { id: _id, capturedBy: _cb, capturedAt: _ca, ...rest } = req.body ?? {};
  if (Object.keys(rest).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }
  const rows = await db.update(staticObjects).set(rest)
    .where(eq(staticObjects.id, req.params.id as string)).returning();
  if (rows.length === 0) { res.status(404).json({ error: "Building not found" }); return; }
  res.json(rows[0]);
});

// DELETE /admin/api/buildings/:id
api.delete("/buildings/:id", async (req: Request, res: Response) => {
  const rows = await db
    .delete(staticObjects)
    .where(eq(staticObjects.id, req.params.id as string))
    .returning({ id: staticObjects.id });
  if (rows.length === 0) { res.status(404).json({ error: "Building not found" }); return; }
  res.json({ success: true });
});

// ── Patrols ──────────────────────────────────────────────────────────────────

// GET /admin/api/patrols?page=1&limit=20&npcId=&active=
api.get("/patrols", async (req: Request, res: Response) => {
  const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const offset = (page - 1) * limit;
  const npcId  = (req.query.npcId as string | undefined)?.trim();
  const active = req.query.active;

  const filters = [];
  if (npcId) filters.push(eq(npcPatrols.npcId, npcId));
  if (active === "true")  filters.push(eq(npcPatrols.isActive, true));
  if (active === "false") filters.push(eq(npcPatrols.isActive, false));

  const where = filters.length > 0 ? and(...filters) : undefined;
  const [rows, totals] = await Promise.all([
    db
      .select({
        id:        npcPatrols.id,
        npcId:     npcPatrols.npcId,
        speed:     npcPatrols.speed,
        waypoints: npcPatrols.waypoints,
        isActive:  npcPatrols.isActive,
        createdAt: npcPatrols.createdAt,
        npcUsername: players.username,
      })
      .from(npcPatrols)
      .leftJoin(players, eq(npcPatrols.npcId, players.id))
      .where(where)
      .orderBy(npcPatrols.createdAt)
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(npcPatrols).where(where),
  ]);
  res.json({ patrols: rows, total: totals[0]?.total ?? 0, page, limit });
});

// GET /admin/api/patrols/:id
api.get("/patrols/:id", async (req: Request, res: Response) => {
  const rows = await db
    .select({
      id:        npcPatrols.id,
      npcId:     npcPatrols.npcId,
      speed:     npcPatrols.speed,
      waypoints: npcPatrols.waypoints,
      isActive:  npcPatrols.isActive,
      createdAt: npcPatrols.createdAt,
      npcUsername: players.username,
    })
    .from(npcPatrols)
    .leftJoin(players, eq(npcPatrols.npcId, players.id))
    .where(eq(npcPatrols.id, req.params.id as string))
    .limit(1);

  if (!rows[0]) {
    res.status(404).json({ error: "Patrol not found" });
    return;
  }
  res.json(rows[0]);
});

// POST /admin/api/patrols
api.post("/patrols", async (req: Request, res: Response) => {
  const { npcId, speed, waypoints, isActive } = req.body ?? {};
  if (!npcId || !waypoints || !Array.isArray(waypoints)) {
    res.status(400).json({ error: "npcId and waypoints are required" });
    return;
  }

  const npc = await db.select({ id: players.id }).from(players).where(eq(players.id, npcId)).limit(1);
  if (!npc[0]) {
    res.status(400).json({ error: "NPC player not found" });
    return;
  }

  const [created] = await db.insert(npcPatrols).values({
    npcId,
    speed:     speed != null ? parseFloat(speed) : 1.4,
    waypoints,
    isActive:  isActive ?? true,
  }).returning();

  res.status(201).json(created);
});

// PUT /admin/api/patrols/:id
api.put("/patrols/:id", async (req: Request, res: Response) => {
  const { id: _id, createdAt: _ca, npcUsername: _nu, ...rest } = req.body ?? {};
  if (Object.keys(rest).length === 0) {
    res.status(400).json({ error: "No fields to update" });
    return;
  }
  const rows = await db
    .update(npcPatrols)
    .set(rest)
    .where(eq(npcPatrols.id, req.params.id as string))
    .returning();
  if (rows.length === 0) {
    res.status(404).json({ error: "Patrol not found" });
    return;
  }
  res.json(rows[0]);
});

// DELETE /admin/api/patrols/:id
api.delete("/patrols/:id", async (req: Request, res: Response) => {
  const rows = await db
    .delete(npcPatrols)
    .where(eq(npcPatrols.id, req.params.id as string))
    .returning({ id: npcPatrols.id });
  if (rows.length === 0) {
    res.status(404).json({ error: "Patrol not found" });
    return;
  }
  res.json({ success: true });
});

router.use("/api", api);

export default router;
