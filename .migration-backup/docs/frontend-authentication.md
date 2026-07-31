# Frontend Authentication Guide

This guide explains the authentication system in the CommerceFlow frontend.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Token Management](#token-management)
- [API Client](#api-client)
- [Authentication Flow](#authentication-flow)
- [Protected Routes](#protected-routes)
- [Hooks](#hooks)
- [Best Practices](#best-practices)

## Architecture Overview

The authentication system consists of:

1. **Token Service** - Manages access and refresh tokens
2. **API Client** - Axios instance with interceptors for auth
3. **Auth Service** - API calls for authentication
4. **Redux Store** - User state management
5. **Auth Provider** - Initializes authentication on app load
6. **Protected Routes** - Components for route protection
7. **Hooks** - React hooks for auth in components

## Token Management

### Token Service (`src/lib/token.service.ts`)

Handles storage and retrieval of authentication tokens.

```typescript
import { TokenService } from '@/lib/token.service';

// Check if user is authenticated
const isAuth = TokenService.isAuthenticated();

// Get tokens
const accessToken = TokenService.getAccessToken();
const refreshToken = TokenService.getRefreshToken();

// Store tokens
TokenService.setTokens(accessToken, refreshToken);

// Clear tokens (logout)
TokenService.clear();
```

### Storage Strategy

- **Access Token**: Stored in memory and sessionStorage
  - Persists across page refreshes within same session
  - Cleared when browser tab closes
  - More secure against XSS attacks

- **Refresh Token**: Stored in localStorage
  - Persists across browser sessions
  - Allows "remember me" functionality
  - Used to obtain new access tokens

**Security Note**: For maximum security in production, use httpOnly cookies for refresh tokens.

## API Client

### Axios Instance (`src/lib/axios.ts`)

Pre-configured axios client with authentication interceptors.

```typescript
import apiClient from '@/lib/axios';

// Automatically includes auth header
const response = await apiClient.get('/users/profile');
```

### Request Interceptor

Automatically adds `Authorization` header to all requests:

```typescript
Authorization: Bearer <access_token>
```

### Response Interceptor

Handles 401 errors with automatic token refresh:

1. Detects 401 Unauthorized response
2. Attempts to refresh access token using refresh token
3. Retries failed request with new token
4. Redirects to login if refresh fails

### Request Queue

Multiple failed requests are queued during token refresh and retried automatically.

## Authentication Flow

### Login Flow

```typescript
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/userSlice';

const dispatch = useAppDispatch();

// Login
const result = await dispatch(login({ email, password })).unwrap();
// Tokens are automatically stored
// User data is stored in Redux
```

### Registration Flow

```typescript
import { register } from '@/store/slices/userSlice';

const result = await dispatch(register({
  email,
  password,
  firstName,
  lastName,
  phone
})).unwrap();
```

### Logout Flow

```typescript
import { logout } from '@/store/slices/userSlice';

await dispatch(logout());
// Tokens are cleared
// User redirected to login
```

### Token Refresh Flow (Automatic)

1. Access token expires
2. API request returns 401
3. Axios interceptor catches error
4. Refresh token sent to `/auth/refresh`
5. New tokens received and stored
6. Original request retried
7. User continues without interruption

## Protected Routes

### Middleware (`src/middleware.ts`)

Next.js middleware protects routes at the edge:

```typescript
// Automatically protects these routes:
const protectedRoutes = ['/profile', '/orders', '/wishlist'];
const adminRoutes = ['/admin'];
```

### ProtectedRoute Component

Client-side route protection:

```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth>
      <div>Protected Content</div>
    </ProtectedRoute>
  );
}
```

### Role-Based Protection

```typescript
<ProtectedRoute requireAuth requireRole="ADMIN">
  <AdminDashboard />
</ProtectedRoute>

// Multiple roles
<ProtectedRoute requireAuth requireRole={['ADMIN', 'SELLER']}>
  <SellerDashboard />
</ProtectedRoute>
```

## Hooks

### useAuth Hook

Primary hook for authentication in components:

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <LoginPrompt />;

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### useRequireAuth Hook

Automatically redirects if not authenticated:

```typescript
import { useRequireAuth } from '@/hooks/useAuth';

function ProtectedPage() {
  const { user, isLoading } = useRequireAuth();
  
  if (isLoading) return <Spinner />;
  
  return <div>Protected content for {user.firstName}</div>;
}
```

### useOptionalAuth Hook

Doesn't redirect, just provides auth state:

```typescript
import { useOptionalAuth } from '@/hooks/useAuth';

function HomePage() {
  const { user, isAuthenticated } = useOptionalAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome back, {user.firstName}!</p>
      ) : (
        <p>Welcome! Please log in.</p>
      )}
    </div>
  );
}
```

## Redux Store

### User Slice

State structure:

```typescript
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Actions

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, register, logout, fetchProfile } from '@/store/slices/userSlice';

const dispatch = useAppDispatch();
const { user, isAuthenticated, isLoading } = useAppSelector(state => state.user);

// Login
await dispatch(login({ email, password }));

// Register
await dispatch(register({ email, password, firstName, lastName }));

// Fetch profile
await dispatch(fetchProfile());

// Logout
await dispatch(logout());
```

## Error Handling

### API Error Handler

Consistent error handling with toast notifications:

```typescript
import { handleApiError, showSuccessToast } from '@/lib/api-error-handler';

try {
  const result = await authService.login(email, password);
  showSuccessToast('Login successful');
} catch (error) {
  handleApiError(error, 'Login failed');
}
```

### Error Types

The handler automatically shows appropriate messages for:

- 400 Bad Request - Validation errors
- 401 Unauthorized - Not logged in
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 429 Too Many Requests - Rate limited
- 500 Server Error - Backend error

## Best Practices

### 1. Always Check Authentication

```typescript
// ✅ Good
const { isAuthenticated, isLoading } = useAuth();
if (isLoading) return <Spinner />;
if (!isAuthenticated) return <LoginPrompt />;

// ❌ Bad
const { user } = useAuth();
if (user) { ... } // Doesn't handle loading state
```

### 2. Use Hooks Over Direct Token Access

```typescript
// ✅ Good
const { user } = useAuth();

// ❌ Bad
const token = TokenService.getAccessToken();
// then manually decoding token
```

### 3. Handle Loading States

```typescript
// ✅ Good
if (isLoading) return <Spinner />;
return <Content />;

// ❌ Bad
return <Content />; // Flashes before auth check
```

### 4. Clear Errors After Display

```typescript
import { clearError } from '@/store/slices/userSlice';

useEffect(() => {
  if (error) {
    // Error is shown via toast
    // Clear after display
    const timer = setTimeout(() => {
      dispatch(clearError());
    }, 100);
    return () => clearTimeout(timer);
  }
}, [error, dispatch]);
```

### 5. Secure Token Storage

```typescript
// ✅ Good - Tokens in memory/storage
TokenService.setTokens(access, refresh);

// ❌ Bad - Tokens in localStorage directly
localStorage.setItem('token', token);
```

### 6. Use ProtectedRoute for Sensitive Pages

```typescript
// ✅ Good
<ProtectedRoute requireAuth>
  <SensitivePage />
</ProtectedRoute>

// ❌ Bad
function SensitivePage() {
  // Auth check inside component
  // Component mounts before redirect
}
```

## Common Patterns

### Auth Provider Setup

In your root layout:

```typescript
import { Provider } from 'react-redux';
import { store } from '@/store';
import AuthProvider from '@/providers/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Provider store={store}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Provider>
      </body>
    </html>
  );
}
```

### Login Page

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/userSlice';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await dispatch(login({ email, password })).unwrap();
      router.push('/');
    } catch (error) {
      // Error handled by slice
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Profile Page

```typescript
'use client';

import { useRequireAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user, isLoading, logout } = useRequireAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.firstName} {user.lastName}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Security Considerations

### XSS Protection

- Access tokens stored in memory (cleared on page close)
- Refresh tokens in localStorage (less critical)
- Never expose tokens in URLs or logs

### CSRF Protection

- Use `SameSite` cookies in production
- Implement CSRF tokens for state-changing operations
- Validate origin headers on backend

### Token Expiration

- Access tokens: 15 minutes (short-lived)
- Refresh tokens: 7 days (longer-lived)
- Automatic refresh before expiration

### Production Recommendations

1. **Use httpOnly cookies** for refresh tokens
   ```typescript
   // Backend sets httpOnly cookie
   res.cookie('refresh_token', token, {
     httpOnly: true,
     secure: true,
     sameSite: 'strict',
     maxAge: 7 * 24 * 60 * 60 * 1000
   });
   ```

2. **Enable HTTPS** in production
3. **Implement rate limiting** on auth endpoints
4. **Use CORS** properly
5. **Monitor for suspicious activity**

## Troubleshooting

### Token Not Persisting

Check if tokens are being stored:
```typescript
console.log('Access Token:', TokenService.getAccessToken());
console.log('Refresh Token:', TokenService.getRefreshToken());
```

### Infinite Redirect Loop

Check middleware configuration and ensure auth routes aren't in protected list.

### 401 After Login

Ensure tokens are being stored after successful login:
```typescript
TokenService.setTokens(result.accessToken, result.refreshToken);
```

### Profile Not Loading

Check if AuthProvider is wrapping your app and fetchProfile is being called.

## Testing

### Mock Authentication

```typescript
import { TokenService } from '@/lib/token.service';

// In tests
beforeEach(() => {
  TokenService.setTokens('mock-access-token', 'mock-refresh-token');
});

afterEach(() => {
  TokenService.clear();
});
```

### Mock User State

```typescript
import { store } from '@/store';
import { setUser } from '@/store/slices/userSlice';

store.dispatch(setUser({
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'CUSTOMER',
}));
```

## Additional Resources

- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP Authentication Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
