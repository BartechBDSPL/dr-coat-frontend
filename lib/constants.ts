const BACKEND_PORT = 4001;
const getBackendURL = (): string => {
  if (typeof window === 'undefined') {
    return `http://localhost:${BACKEND_PORT}`;
  }
  const hostname = window.location.hostname;
  return `http://${hostname}:${BACKEND_PORT}`;
};
export const BACKEND_URL = getBackendURL();
export const SECRET_KEY = 'bdspl';
export const ITEMS_PER_PAGE = 5;
export const originalKey = 'sblw-3hn8-sqoy19';
export const INACTIVITY_TIMEOUT = 40 * 60 * 1000;
