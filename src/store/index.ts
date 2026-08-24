import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '@/features/api/apiSlice';
import authReducer from './authSlice';
import uiReducer from './uiSlice';

// Single Redux store.
// NOTE: RTK Query's reducer + middleware live under `apiSlice.reducerPath`.
// Redux holds: auth (business) + ui (business). Server state stays in RTK Query.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
