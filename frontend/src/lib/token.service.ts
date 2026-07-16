let accessToken: string | null = null;

const REFRESH_TOKEN_KEY = 'cf_refresh_token';

function getRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setRefreshToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {}
}

export const TokenService = {
  getAccessToken(): string | null {
    return accessToken;
  },

  getRefreshToken(): string | null {
    return getRefreshToken();
  },

  setTokens(access: string, refresh: string): void {
    accessToken = access;
    setRefreshToken(refresh);
  },

  setAccessToken(token: string): void {
    accessToken = token;
  },

  clear(): void {
    accessToken = null;
    setRefreshToken(null);
  },

  hasTokens(): boolean {
    return accessToken !== null || getRefreshToken() !== null;
  },

  getAuthorizationHeader(): string | null {
    return accessToken ? `Bearer ${accessToken}` : null;
  },
};
