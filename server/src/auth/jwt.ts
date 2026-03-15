import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET ?? "dev-access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";
const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

export interface AccessPayload {
  id: string;
  username: string;
}

export interface RefreshPayload {
  id: string;
}

export function signAccess(id: string, username: string): string {
  return jwt.sign({ id, username } as AccessPayload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

export function signRefresh(id: string): string {
  return jwt.sign({ id } as RefreshPayload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

export function verifyAccess(token: string): AccessPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as AccessPayload;
  } catch {
    return null;
  }
}

export function verifyRefresh(token: string): RefreshPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as RefreshPayload;
  } catch {
    return null;
  }
}
