import path from "path";
import { Router, Request, Response } from "express";
import { db } from "./db";
import { players, playerTracks, staticObjects } from "./db/schema";
import { desc, gte } from "drizzle-orm";

const router = Router();

router.get("/ui", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "templates", "status.html"));
});

router.get("/", async (_req: Request, res: Response) => {
  const [allPlayers, recentTracks, objects] = await Promise.all([
    db
      .select({
        id: players.id,
        unitType: players.unitType,
        faction: players.faction,
        isAlive: players.isAlive,
        lastLat: players.lastLat,
        lastLng: players.lastLng,
        lastSeen: players.lastSeen,
        createdAt: players.createdAt,
      })
      .from(players)
      .orderBy(desc(players.lastSeen)),

    db
      .select()
      .from(playerTracks)
      .where(gte(playerTracks.recordedAt, new Date(Date.now() - 60 * 60 * 1000)))
      .orderBy(desc(playerTracks.recordedAt))
      .limit(50),

    db.select().from(staticObjects),
  ]);

  res.json({ players: allPlayers, recentTracks, staticObjects: objects });
});

export default router;
