// All persistence is local (localStorage). Nothing is sent anywhere.
const K = { prefs: "bacon.prefs.v1", history: "bacon.history.v1" };
export const MAX_HISTORY = 50;
function read(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }
export const loadPrefs = () => { const p = read(K.prefs, {}); return p && typeof p === "object" ? p : {}; };
export const savePrefs = (p) => write(K.prefs, p);
export const loadHistory = () => { const h = read(K.history, []); return Array.isArray(h) ? h : []; };
export function addHistory(e) {
  const h = loadHistory();
  if (h[0] && h[0].input === e.input && h[0].src === e.src && h[0].tgt === e.tgt) return h;
  h.unshift(e);
  h.length = Math.min(h.length, MAX_HISTORY);
  write(K.history, h);
  return h;
}
export function removeHistory(id) { const h = loadHistory().filter((x) => x.id !== id); write(K.history, h); return h; }
export function clearHistory() { try { localStorage.removeItem(K.history); } catch {} }
