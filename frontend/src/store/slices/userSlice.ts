import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { TokenService } from '@/lib/token.service';
import type { User } from '@/types/api';

interface UserState {
  user: (Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'phone' | 'avatar' | 'isEmailVerified'>) | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await authService.login(email, password);
      TokenService.setTokens(result.accessToken, result.refreshToken);
      return result;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'user/register',
  async (payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }, { rejectWithValue }) => {
    try {
      const result = await authService.register(payload);
      TokenService.setTokens(result.accessToken, result.refreshToken);
      return result;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getProfile();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string }; status?: number } };
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to fetch profile',
        status: err.response?.status,
      });
    }
  }
);

export const googleLogin = createAsyncThunk(
  'user/googleLogin',
  async (idToken: string, { rejectWithValue }) => {
    try {
      const result = await authService.googleLogin(idToken);
      TokenService.setTokens(result.accessToken, result.refreshToken);
      return result;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Google sign-in failed');
    }
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async () => {
    try {
      const refreshToken = TokenService.getRefreshToken();
      await authService.logout(refreshToken || undefined);
    } catch {}
    TokenService.clear();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState['user']>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user as UserState['user'];
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user as UserState['user'];
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(googleLogin.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user as UserState['user'];
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProfile.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload as { message?: string; status?: number } | undefined;
        if (payload?.status === 401) {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.error = payload?.message || null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearError } = userSlice.actions;
export default userSlice.reducer;
