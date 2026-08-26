import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// BUSINESS/GLOBAL state -> Redux Toolkit.
// Auth is genuine global business state, NOT server cache (that's RTK Query's job).
// Token is persisted to localStorage so the session survives reloads (client-only).
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

const loadToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jhd_token');
};
const loadUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('jhd_user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

const initialState: AuthState = {
  user: loadUser(),
  token: loadToken(),
  isAuthenticated: !!loadToken(),
};

const persist = (user: AuthUser | null, token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('jhd_token', token);
    localStorage.setItem('jhd_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('jhd_token');
    localStorage.removeItem('jhd_user');
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      persist(action.payload.user, action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      persist(null, null);
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
