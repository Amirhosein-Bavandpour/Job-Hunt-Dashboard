import { createSlice, type PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// BUSINESS/GLOBAL state -> Redux Toolkit.
// Auth is genuine global business state, NOT server cache (that's RTK Query's job).
// The real JWT lives in an httpOnly cookie (invisible to JS). We still keep a
// lightweight user object in Redux for UI purposes (greeting, avatar, etc.).

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null; // placeholder for the cookie-based token (for UI only)
  isAuthenticated: boolean;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
};

// After mount on the client, call GET /api/auth/me so the server confirms the
// session via the httpOnly cookie. Replaces the old localStorage-only check.
// Does nothing during SSR (store is empty, no window).
export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }
  let result: { ok: boolean; user?: { id: string; name: string; email: string } } | null = null;
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      result = await res.json();
    }
  } catch {
    result = null;
  }
  if (result?.ok && result.user) {
    return {
      user: result.user as AuthUser,
      token: `real.${result.user.email}.jwt` as string,
    };
  }
  return { user: null, token: null };
});

const persistUser = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem('jhd_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('jhd_user');
  }
};

type HydrateAction = PayloadAction<{ user: AuthUser | null; token: string | null }>;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrate: (state, action: HydrateAction) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.user;
      state.hydrated = true;
    },
    login: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.hydrated = true;
      persistUser(action.payload.user);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.hydrated = true;
      persistUser(null);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateAuth.fulfilled, (state, action: HydrateAction) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.user;
      state.hydrated = true;
    });
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

// Re-export the async thunk so Provider can dispatch it.
