export function createLocalStorage<T>(key: string, defaults: T): {
  get: () => T;
  set: (value: T) => void;
} {
  return {
    get: () => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return defaults;
        return JSON.parse(raw) as T;
      } catch {
        return defaults;
      }
    },
    set: (value: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // ignore
      }
    }
  };
}

