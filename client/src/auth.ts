// In-memory access token — cleared on page reload
let _accessToken: string | null = null;
let _playerId: string | null = null;
let _username: string | null = null;

const REFRESH_TOKEN_KEY = "refreshToken";
const PLAYER_ID_KEY = "playerId";
const USERNAME_KEY = "username";

function decodeJwtUsername(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { username } = JSON.parse(decoded);
    return username ?? null;
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, refreshToken: string, id: string): void {
  _accessToken = accessToken;
  _playerId = id;
  _username = decodeJwtUsername(accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(PLAYER_ID_KEY, id);
  if (_username) localStorage.setItem(USERNAME_KEY, _username);
}

export function getAccessToken(): string | null {
  return _accessToken;
}

export function getPlayerId(): string | null {
  return _playerId ?? localStorage.getItem(PLAYER_ID_KEY);
}

export function hasSession(): boolean {
  return !!localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUsername(): string | null {
  return _username ?? localStorage.getItem(USERNAME_KEY);
}

export function clearSession(): void {
  _accessToken = null;
  _playerId = null;
  _username = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PLAYER_ID_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  try {
    const res = await fetch("/api/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearSession();
      return false;
    }
    const { accessToken, id } = await res.json();
    _accessToken = accessToken;
    _playerId = id ?? localStorage.getItem(PLAYER_ID_KEY);
    _username = decodeJwtUsername(accessToken);
    if (_username) localStorage.setItem(USERNAME_KEY, _username);
    return true;
  } catch {
    return false;
  }
}
