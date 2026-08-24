import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Minimal Redux UI/business state that is NOT ephemeral enough for Zustand
// and NOT server state (so not RTK Query).
// Example: a global "selected application id" used across pages, or a saved view mode.
interface UiState {
  selectedApplicationId: string | null;
  applicationView: 'table' | 'kanban';
}

const initialState: UiState = {
  selectedApplicationId: null,
  applicationView: 'table',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedApplication: (state, action: PayloadAction<string | null>) => {
      state.selectedApplicationId = action.payload;
    },
    setApplicationView: (state, action: PayloadAction<'table' | 'kanban'>) => {
      state.applicationView = action.payload;
    },
  },
});

export const { setSelectedApplication, setApplicationView } = uiSlice.actions;
export default uiSlice.reducer;
