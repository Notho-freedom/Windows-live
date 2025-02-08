// redux/reducers.js
import { OPEN_WINDOW, CLOSE_WINDOW, MINIMIZE_WINDOW, MAXIMIZE_WINDOW } from './actions';

const initialState = {
  windows: [],
};

const windowReducer = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_WINDOW:
      return {
        ...state,
        windows: [
          ...state.windows,
          { id: action.payload.windowId, content: action.payload.content, isMaximized: false, isMinimized: false },
        ],
      };
    case CLOSE_WINDOW:
      return {
        ...state,
        windows: state.windows.filter((window) => window.id !== action.payload.windowId),
      };
    case MINIMIZE_WINDOW:
      return {
        ...state,
        windows: state.windows.map((window) =>
          window.id === action.payload.windowId ? { ...window, isMinimized: true } : window
        ),
      };
    case MAXIMIZE_WINDOW:
      return {
        ...state,
        windows: state.windows.map((window) =>
          window.id === action.payload.windowId ? { ...window, isMaximized: !window.isMaximized } : window
        ),
      };
    default:
      return state;
  }
};

export default windowReducer;
