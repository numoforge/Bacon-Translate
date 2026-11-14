// Translation engine: Google's unofficial, keyless web endpoint. See README for limitations.
import { normalizeCode } from "./languages.js";

export const MAX_CHARS = 5000;          // total input limit in the UI
export const MAX_ENCODED = 3000;        // max URL-encoded size of one request's text
const ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const TIMEOUT_MS = 15000;

export class TranslateError extends Error {
  constructor(code, message) { super(message); this.name = "TranslateError"; this.code = code; }
}

const enc = (s) => encodeURIComponent(s).length;

/** Splits text into chunks whose URL-encoded size is <= limit. Joining the chunks gives back the exact input. */
export function splitIntoChunks(text, limit = MAX_ENCODED) {
  const pieces = [];
  for (const part of text.split(/(\n+)/)) {
    if (!part) continue;
    if (enc(part) <= limit) { pieces.push(part); continue; }
    const sentences = part.match(/[^.!?。！？]+[.!?。！？]*\s*|[.!?。！？]+\s*/g) || [part];
    for (const s of sentences) {
      if (enc(s) <= limit) { pieces.push(s); continue; }
      let cur = "";
      for (const ch of Array.from(s)) {
        if (enc(cur + ch) > limit) { pieces.push(cur); cur = ""; }
        cur += ch;
      }
      if (cur) pieces.push(cur);
    }
  }
  const chunks = [];
  let cur = "";
  for (const p of pieces) {
    if (cur && enc(cur + p) > limit) { chunks.push(cur); cur = ""; }
    cur += p;
  }
  if (cur) chunks.push(cur);
  return chunks;
}

export function parseResponse(data) {
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new TranslateError("bad_response", "Google Translate returned an unexpected response. The service may have changed.");
  }
  const text = data[0].map((s) => (Array.isArray(s) && typeof s[0] === "string" ? s[0] : "")).join("");
  return { text, detected: typeof data[2] === "string" ? normalizeCode(data[2]) : null };
}

async function requestChunk(chunk, sl, tl, signal) {
  const url = `${ENDPOINT}?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&ie=UTF-8&oe=UTF-8&q=${encodeURIComponent(chunk)}`;
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (signal?.aborted) throw new TranslateError("aborted", "Cancelled");
    const ctrl = new AbortController();
    let timedOut = false;
    const onAbort = () => ctrl.abort();
    signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: ctrl.signal, credentials: "omit", referrerPolicy: "no-referrer" });
      if (res.status === 429) throw new TranslateError("rate_limited", "Google Translate is limiting requests from your network. Please wait a bit and try again.");
      if (res.status >= 500) { lastErr = new TranslateError("server", `Google Translate had a server error (${res.status}).`); }
      else if (!res.ok) throw new TranslateError("http", `Google Translate rejected the request (HTTP ${res.status}).`);
      else {
        let data;
        try { data = await res.json(); } catch { throw new TranslateError("bad_response", "Google Translate returned an unreadable response."); }
        return parseResponse(data);
      }
    } catch (e) {
      if (e instanceof TranslateError) { if (e.code !== "server") throw e; }
      else if (signal?.aborted) throw new TranslateError("aborted", "Cancelled");
      else if (timedOut) lastErr = new TranslateError("timeout", "The request timed out. Check your connection and try again.");
      else lastErr = new TranslateError("network", "Could not reach Google Translate. You may be offline, or a browser extension/network is blocking the request.");
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
  }
  throw lastErr;
}

const cache = new Map();

/** Translates text. sl may be "auto". Returns { text, detected }. */
export async function translate(text, sl, tl, { signal } = {}) {
  const key = `${sl}|${tl}|${text}`;
  if (cache.has(key)) return cache.get(key);
  let out = "";
  let detected = null;
  for (const chunk of splitIntoChunks(text)) {
    if (!chunk.trim()) { out += chunk; continue; }
    const r = await requestChunk(chunk, sl, tl, signal);
    out += r.text;
    detected = detected || r.detected;
  }
  const result = { text: out, detected };
  cache.set(key, result);
  if (cache.size > 100) cache.delete(cache.keys().next().value);
  return result;
}
