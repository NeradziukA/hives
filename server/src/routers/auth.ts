import { Router, Request, Response } from "express";
import { verifyPlayerCredentials, findPlayerById } from "../db/queries";
import { signAccess, signRefresh, verifyRefresh, verifyAccess } from "../auth/jwt";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }
  const result = await verifyPlayerCredentials(username, password);
  if (!result) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const accessToken = signAccess(result.id, username);
  const refreshToken = signRefresh(result.id);
  res.json({ accessToken, refreshToken, id: result.id });
});

router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) {
    res.status(400).json({ error: "refreshToken is required" });
    return;
  }
  const payload = verifyRefresh(refreshToken);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }
  const player = await findPlayerById(payload.id);
  if (!player) {
    res.status(401).json({ error: "Player not found" });
    return;
  }
  const accessToken = signAccess(payload.id, player.username ?? "");
  res.json({ accessToken, id: payload.id });
});

router.get("/profile", async (req: Request, res: Response) => {
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
  const player = await findPlayerById(payload.id);
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json({
    strength:     player.strength,
    defense:      player.defense,
    agility:      player.agility,
    speed:        player.speed,
    intelligence: player.intelligence,
    hp:           player.hp,
    maxHp:        player.maxHp,
    leadership:   player.leadership,
    vision:       player.vision,
    vaccineLevel: player.vaccineLevel,
    bagSize:      player.bagSize,
    heavyWeapon:  player.heavyWeapon,
    twoHanded:    player.twoHanded,
    camouflage:   player.camouflage,
    regeneration: player.regeneration,
    stench:       player.stench,
    mutation:     player.mutation,
    role:         player.role,
    faction:      player.faction,
    unitType:     player.unitType,
    isAlive:      player.isAlive,
  });
});

export default router;
