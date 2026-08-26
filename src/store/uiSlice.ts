import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Redux holds genuine GLOBAL BUSINESS state only.
// NOTE: view mode (table/kanban) is intentionally NOT here — it's ephemeral
// UI state, so it lives in Zustand (dashboardUIStore.kanbanMode). This avoids
// the anti-pattern of two stores owning the same piece of state.
interface UiState {
  selectedApplicationId: string | null;
}

const initialState: UiState = {
  selectedApplicationId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedApplication: (state, action: PayloadAction<string | null>) => {
      state.selectedApplicationId = action.payload;
    },
  },
});

export const { setSelectedApplication } = uiSlice.actions;
export default uiSlice.reducer;
