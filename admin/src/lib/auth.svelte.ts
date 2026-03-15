const TOKEN_KEY = 'adminToken';
const REFRESH_KEY = 'adminRefreshToken';

let _accessToken = $state<string | null>(localStorage.getItem(TOKEN_KEY));
let _refreshToken = $state<string | null>(localStorage.getItem(REFRESH_KEY));

export const auth = {
  get token() { return _accessToken; },
  get refreshToken() { return _refreshToken; },

  save(at: string, rt?: string) {
    _accessToken = at;
    localStorage.setItem(TOKEN_KEY, at);
    if (rt !== undefined) {
      _refreshToken = rt;
      localStorage.setItem(REFRESH_KEY, rt);
    }
  },

  clear() {
    _accessToken = null;
    _refreshToken = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
