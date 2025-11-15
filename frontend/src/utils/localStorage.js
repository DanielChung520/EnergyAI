const STORAGE_KEY = 'energyai_user_state';

export const saveUserState = (username, lastPath) => {
  const state = {
    username,
    lastPath,
    timestamp: Date.now(),
    expiresIn: 7 * 24 * 60 * 60 * 1000 // 一周的毫秒數
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const getUserState = () => {
  const stateStr = localStorage.getItem(STORAGE_KEY);
  if (!stateStr) return null;

  const state = JSON.parse(stateStr);
  const now = Date.now();
  
  // 檢查是否過期
  if (now - state.timestamp > state.expiresIn) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }

  return state;
};

export const clearUserState = () => {
  localStorage.removeItem(STORAGE_KEY);
}; 