// Acceso seguro a localStorage con respaldo en memoria. Si el navegador lo
// bloquea (modo privado, datos de sitio deshabilitados) la página sigue
// funcionando con IDs en memoria para esa carga; nunca se recurre a
// fingerprinting.

const memory = new Map<string, string>();
// Claves cuya escritura en localStorage falló: se leen de memoria.
const memoryOnly = new Set<string>();

const getLocalStorage = (): Storage | null => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

export const storageGet = (key: string): string | null => {
  if (memoryOnly.has(key)) return memory.get(key) ?? null;
  try {
    const ls = getLocalStorage();
    if (ls) return ls.getItem(key);
  } catch {
    /* cae a memoria */
  }
  return memory.get(key) ?? null;
};

export const storageSet = (key: string, value: string): void => {
  memory.set(key, value);
  try {
    const ls = getLocalStorage();
    if (ls) {
      ls.setItem(key, value);
      memoryOnly.delete(key);
      return;
    }
  } catch {
    /* cae a memoria */
  }
  memoryOnly.add(key);
};

export const storageRemove = (key: string): void => {
  memory.delete(key);
  memoryOnly.delete(key);
  try {
    getLocalStorage()?.removeItem(key);
  } catch {
    /* nada que hacer */
  }
};

/** Solo para pruebas. */
export const resetStorageMemory = (): void => {
  memory.clear();
  memoryOnly.clear();
};
