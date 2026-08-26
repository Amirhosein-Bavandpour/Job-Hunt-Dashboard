import { createSlice } from '@reduxjs/toolkit';

// Redux holds genuine GLOBAL BUSINESS state only.
// NOTE: view mode (table/kanban) is intentionally NOT here — it's ephemeral
// UI state, so it lives in Zustand (dashboardUIStore.kanbanMode). This avoids
// the anti-pattern of two stores owning the same piece of state.
// Auth (also business state) has its own slice (authSlice).
const uiSlice = createSlice({
  name: 'ui',
  initialState: {},
  reducers: {},
});

export default uiSlice.reducer;
