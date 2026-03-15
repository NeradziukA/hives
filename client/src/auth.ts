// In-memory access token — cleared on page reload
let _accessToken: string | null = null;
let _playerId: string | null = null;

const REFRESH_TOKEN_KEY = "refreshToken";
const PLAYER_ID_KEY = "playerId";

export function setTokens(accessToken: string, refreshToken: string, id: string): void {
  _accessToken = accessToken;
  _playerId = id;
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(PLAYER_ID_KEY, id);
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

export function clearSession(): void {
  _accessToken = null;
  _playerId = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(PLAYER_ID_KEY);
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
    return true;
  } catch {
    return false;
  }
}
