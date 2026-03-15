import path from "path";
import { Router, Request, Response, NextFunction } from "express";
import { eq, ilike, or, and, gte, lte, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { players } from "../db/schema";
import { verifyAccess } from "../auth/jwt";

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

  const filters = [];

  if (q) {
    filters.push(or(ilike(players.username, `%${q}%`), eq(players.id, q)));
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

  res.json({ users: rows, total: totals[0]?.total ?? 0, page, limit });
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
  res.json(safe);
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

router.use("/api", api);

export default router;
