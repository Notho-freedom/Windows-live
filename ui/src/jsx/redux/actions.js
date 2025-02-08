// redux/actions.js

export const OPEN_WINDOW = 'OPEN_WINDOW';
export const CLOSE_WINDOW = 'CLOSE_WINDOW';
export const MINIMIZE_WINDOW = 'MINIMIZE_WINDOW';
export const MAXIMIZE_WINDOW = 'MAXIMIZE_WINDOW';

export const openWindow = (windowId, content) => ({
  type: OPEN_WINDOW,
  payload: { windowId, content }
});

export const closeWindow = (windowId) => ({
  type: CLOSE_WINDOW,
  payload: { windowId }
});

export const minimizeWindow = (windowId) => ({
  type: MINIMIZE_WINDOW,
  payload: { windowId }
});

export const maximizeWindow = (windowId) => ({
  type: MAXIMIZE_WINDOW,
  payload: { windowId }
});
