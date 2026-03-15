import { Router, Request, Response } from "express";
import { verifyPlayerCredentials } from "./db/queries";

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
  res.json({ id: result.id });
});

export default router;
