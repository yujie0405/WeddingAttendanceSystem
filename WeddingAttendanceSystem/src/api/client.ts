import type { WeddingState } from "../types";
import { canonicalKey, migrate, normalizeData } from "./migrations";
let snapshot: WeddingState | undefined;
const listeners = new Set<() => void>();
function notify(next: WeddingState) {
  snapshot = next;
  listeners.forEach((fn) => fn());
}
export const weddingStore = {
  getSnapshot(): WeddingState {
    if (!snapshot) {
      const loaded = migrate();
      localStorage.setItem(canonicalKey, JSON.stringify(loaded));
      snapshot = loaded;
    }
    return snapshot;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  async transact<T>(change: (draft: WeddingState) => T): Promise<T> {
    const commit = () => {
      const raw = localStorage.getItem(canonicalKey);
      const draft = structuredClone(
        raw ? normalizeData(JSON.parse(raw)) : weddingStore.getSnapshot(),
      );
      const result = change(draft);
      const next = normalizeData(draft);
      localStorage.setItem(canonicalKey, JSON.stringify(next));
      notify(next);
      return result;
    };
    return navigator.locks
      ? navigator.locks.request(canonicalKey, commit)
      : commit();
  },
  replace(raw: unknown) {
    const next = normalizeData(raw);
    // Keep an explicit recovery copy before importing a replacement dataset.
    const previous = localStorage.getItem(canonicalKey);
    if (previous)
      localStorage.setItem(canonicalKey + ":backup:" + Date.now(), previous);
    localStorage.setItem(canonicalKey, JSON.stringify(next));
    notify(next);
  },
};
window.addEventListener("storage", (event) => {
  if (event.key !== canonicalKey || !event.newValue) return;
  try {
    notify(normalizeData(JSON.parse(event.newValue)));
  } catch {
    /* Do not replace a valid visible dataset with invalid external data. */
  }
});
