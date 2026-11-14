import test from "node:test";
import assert from "node:assert/strict";
import { splitIntoChunks, parseResponse, translate, TranslateError } from "../js/translate.js";
import { normalizeCode, languageName, LANGUAGES } from "../js/languages.js";

test("chunks rejoin exactly and respect limit (latin, CJK, no punctuation)", () => {
  for (const t of ["Hello. ".repeat(900) + "\n\nNew para! ".repeat(50), "你好。".repeat(1500), "a".repeat(5000), "x y ".repeat(1250)]) {
    const chunks = splitIntoChunks(t, 3000);
    assert.equal(chunks.join(""), t);
    for (const c of chunks) assert.ok(encodeURIComponent(c).length <= 3000);
  }
});
test("parseResponse joins segments and normalizes detected code", () => {
  assert.deepEqual(parseResponse([[["Hola ", "Hello "], ["mundo", "world"]], null, "en"]), { text: "Hola mundo", detected: "en" });
  assert.equal(parseResponse([[["x", "y"]], null, "iw"]).detected, "he");
  assert.throws(() => parseResponse({}), (e) => e.code === "bad_response");
});
test("translate: multi-chunk, auto detect, cache", async () => {
  let calls = 0;
  globalThis.fetch = async (url) => { calls++; const q = new URL(url).searchParams.get("q"); return { ok: true, status: 200, json: async () => [[[q.toUpperCase(), q]], null, "fr"] }; };
  const text = "Bonjour. ".repeat(700);
  const r = await translate(text, "auto", "en");
  assert.equal(r.text, text.toUpperCase()); assert.equal(r.detected, "fr"); assert.ok(calls > 1);
  const before = calls; await translate(text, "auto", "en"); assert.equal(calls, before);
});
test("errors: 429, 500 retry, network, abort", async () => {
  globalThis.fetch = async () => ({ ok: false, status: 429 });
  await assert.rejects(translate("a1", "auto", "en"), (e) => e.code === "rate_limited");
  let n = 0; globalThis.fetch = async () => { n++; return { ok: false, status: 503 }; };
  await assert.rejects(translate("a2", "auto", "en"), (e) => e.code === "server"); assert.equal(n, 2);
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  await assert.rejects(translate("a3", "auto", "en"), (e) => e.code === "network");
  const ac = new AbortController(); ac.abort();
  await assert.rejects(translate("a4", "auto", "en", { signal: ac.signal }), (e) => e.code === "aborted");
});
test("languages", () => {
  assert.ok(LANGUAGES.length > 100); assert.equal(normalizeCode("zh"), "zh-CN"); assert.equal(languageName("jw"), "Javanese");
  assert.equal(new Set(LANGUAGES.map((l) => l.code)).size, LANGUAGES.length);
});
