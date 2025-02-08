import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  windows: [],
};

const windowSlice = createSlice({
  name: 'windows',
  initialState,
  reducers: {
    addWindow: (state, action) => {
      state.windows.push(action.payload);
    },
    removeWindow: (state, action) => {
      state.windows = state.windows.filter(window => window.id !== action.payload.id);
    },
    updateWindowPosition: (state, action) => {
      const { id, position } = action.payload;
      const window = state.windows.find(window => window.id === id);
      if (window) {
        window.position = position;
      }
    },
    updateWindowSize: (state, action) => {
      const { id, size } = action.payload;
      const window = state.windows.find(window => window.id === id);
      if (window) {
        window.size = size;
      }
    },
    toggleWindowMaximized: (state, action) => {
      const { id } = action.payload;
      const window = state.windows.find(window => window.id === id);
      if (window) {
        window.isMaximized = !window.isMaximized;
      }
    },
    minimizeWindow: (state, action) => {
      const { id } = action.payload;
      const window = state.windows.find(window => window.id === id);
      if (window) {
        window.isMinimized = true;
      }
    },
    restoreWindow: (state, action) => {
      const { id } = action.payload;
      const window = state.windows.find(window => window.id === id);
      if (window) {
        window.isMinimized = false;
        window.isMaximized = false;
      }
    },
  },
});

export const {
  addWindow,
  removeWindow,
  updateWindowPosition,
  updateWindowSize,
  toggleWindowMaximized,
  minimizeWindow,
  restoreWindow,
} = windowSlice.actions;

export default windowSlice.reducer;
