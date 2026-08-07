let accessToken: string | null = null;

const REFRESH_TOKEN_KEY = 'cf_refresh_token';
const ACCESS_TOKEN_KEY = 'cf_access_token';

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Store access token in memory for security
// Store refresh token in localStorage (better) or sessionStorage (more secure but doesn't persist)
// For production, use httpOnly cookies via backend
function getRefreshToken(): string | null {
  if (!isBrowser) return null;
  try {
    // Try localStorage first (persists across sessions)
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setRefreshToken(token: string | null): void {
  if (!isBrowser) return;
  try {
    if (token) {
      // Store in localStorage to persist across browser sessions
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      // Also keep in sessionStorage as fallback
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to store refresh token:', error);
  }
}

// Optionally persist access token to survive page refreshes
function persistAccessToken(token: string | null): void {
  if (!isBrowser) return;
  try {
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {}
}

function loadPersistedAccessToken(): string | null {
  if (!isBrowser) return null;
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

// Initialize access token from session storage if available
if (isBrowser && !accessToken) {
  accessToken = loadPersistedAccessToken();
}

export const TokenService = {
  getAccessToken(): string | null {
    return accessToken;
  },

  getRefreshToken(): string | null {
    return getRefreshToken();
  },

  setTokens(access: string, refresh: string, remember = true): void {
    accessToken = access;
    try {
      if (isBrowser) {
        // "Remember me" = persist refresh token across browser sessions.
        // Otherwise keep it in sessionStorage only (cleared on tab close).
        if (remember) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
        } else {
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
        sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      }
    } catch (error) {
      console.error('Failed to store refresh token:', error);
    }
    persistAccessToken(access);
  },

  setAccessToken(token: string): void {
    accessToken = token;
    persistAccessToken(token);
  },

  clear(): void {
    accessToken = null;
    setRefreshToken(null);
    persistAccessToken(null);
  },

  hasTokens(): boolean {
    return accessToken !== null || getRefreshToken() !== null;
  },

  getAuthorizationHeader(): string | null {
    return accessToken ? `Bearer ${accessToken}` : null;
  },

  isAuthenticated(): boolean {
    return this.hasTokens();
  },
};
