let accessToken: string | null = null;

const REFRESH_TOKEN_KEY = 'cf_refresh_token';
const ACCESS_TOKEN_KEY = 'cf_access_token';

// Cookie names for middleware (server-side) detection
const ACCESS_TOKEN_COOKIE = 'cf_access_token';
const REFRESH_TOKEN_COOKIE = 'cf_refresh_token';

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Helper to set a cookie with SameSite and path
function setCookie(name: string, value: string, maxAgeDays: number = 7): void {
  if (!isBrowser) return;
  try {
    const expires = new Date(Date.now() + maxAgeDays * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure=${location.protocol === 'https:'}`;
  } catch {}
}

// Helper to remove a cookie
function removeCookie(name: string): void {
  if (!isBrowser) return;
  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch {}
}

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
      // Set cookie for middleware (server-side) detection
      setCookie(REFRESH_TOKEN_COOKIE, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      // Remove cookie for middleware
      removeCookie(REFRESH_TOKEN_COOKIE);
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
      // Set cookie for middleware (server-side) detection
      setCookie(ACCESS_TOKEN_COOKIE, token, 1); // 1 day expiry for access token
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      // Remove cookie for middleware
      removeCookie(ACCESS_TOKEN_COOKIE);
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

  setTokens(access: string, refresh: string): void {
    accessToken = access;
    setRefreshToken(refresh);
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
