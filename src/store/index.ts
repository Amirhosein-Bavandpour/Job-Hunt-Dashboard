import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/features/api/apiSlice';
import authReducer from './authSlice';
import uiReducer from './uiSlice';

// Single Redux store.
// NOTE: RTK Query's reducer + middleware live under `apiSlice.reducerPath`.
// Redux holds: auth (business) + ui (business). Server state stays in RTK Query.
function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });
}

// Cache the store on globalThis so Next.js Fast Refresh / HMR does NOT create a
// new store instance on every hot reload. Without this, the <Provider> can hold
// a stale store while RTK Query dispatches on a fresh one -> queries hang on
// "loading" forever in dev. (Standard RTK + Next.js App Router pattern.)
const store = (globalThis as any).__JHD_STORE__ ?? makeStore();
if (process.env.NODE_ENV !== 'production') {
  (globalThis as any).__JHD_STORE__ = store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export { store };
