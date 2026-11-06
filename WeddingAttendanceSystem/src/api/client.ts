export const storage = {
  get: <T>(key: string, fallback: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  },
  set: <T>(key: string, data: T): void => {
    localStorage.setItem(key, JSON.stringify(data));
  }
};