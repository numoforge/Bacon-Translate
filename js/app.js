import { LANGUAGES, languageName, normalizeCode, isSupported } from "./languages.js";
import { translate, MAX_CHARS } from "./translate.js";
import * as store from "./storage.js";

const $ = (id) => document.getElementById(id);
const el = Object.fromEntries(["input","output","srcBtn","tgtBtn","srcName","tgtName","swapBtn","pasteBtn","clearBtn","copyBtn","translateBtn","instant","status","counter","inLabel","themeBtn","historyBtn","privacyBtn","picker","pickerTitle","pickerSearch","pickerList","historyDlg","historyList","saveHistory","clearHistoryBtn","privacyDlg"].map((k) => [k, $(k)]));

const prefs = store.loadPrefs();
function guessTarget() {
  const l = navigator.language || "en";
  for (const c of [normalizeCode(l), normalizeCode(l.split("-")[0])]) if (isSupported(c)) return normalizeCode(c);
  return "en";
}
const state = {
  src: prefs.src === "auto" || isSupported(prefs.src) ? prefs.src : "auto",
  tgt: isSupported(prefs.tgt) ? normalizeCode(prefs.tgt) : guessTarget(),
  instant: prefs.instant !== false,
  saveHistory: prefs.saveHistory !== false,
  theme: ["system", "light", "dark"].includes(prefs.theme) ? prefs.theme : "system",
  detected: null, seq: 0, controller: null, result: "", pending: null,
};
const persist = () => store.savePrefs({ src: state.src, tgt: state.tgt, instant: state.instant, saveHistory: state.saveHistory, theme: state.theme });
const count = (s) => Array.from(s).length;
let debounceT, histT;

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  const label = { system: "◐ Auto", light: "☀ Light", dark: "☾ Dark" }[state.theme];
  el.themeBtn.textContent = label; el.themeBtn.setAttribute("aria-label", "Theme: " + state.theme + " (click to change)");
}
function renderLangs() {
  el.srcName.textContent = state.src === "auto" ? (state.detected ? `${languageName(state.detected)} (auto)` : "Auto-detect") : languageName(state.src);
  el.tgtName.textContent = languageName(state.tgt);
  el.inLabel.textContent = state.src === "auto" ? (state.detected ? `${languageName(state.detected)} (detected)` : "Auto-detect") : languageName(state.src);
  el.swapBtn.disabled = state.src === "auto" && !state.detected;
}
function renderCounter() {
  const n = count(el.input.value);
  el.counter.textContent = `${n.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`;
  el.counter.classList.toggle("over", n > MAX_CHARS);
  el.translateBtn.disabled = !el.input.value.trim() || el.translateBtn.classList.contains("busy");
}
function showStatus(msg, retry) {
  el.status.textContent = msg; el.status.hidden = false;
  if (retry) { const b = document.createElement("button"); b.type = "button"; b.textContent = "Retry"; b.onclick = () => run(true); el.status.append(b); }
}
const clearStatus = () => { el.status.hidden = true; el.status.textContent = ""; };
function setLoading(on) {
  el.translateBtn.classList.toggle("busy", on);
  el.translateBtn.firstChild && (el.translateBtn.textContent = on ? "Translating…" : "Translate");
  el.output.classList.toggle("loading", on);
  el.output.setAttribute("aria-busy", on);
  renderCounter();
}
function setOutput(t) { state.result = t; el.output.textContent = t; el.copyBtn.disabled = !t; }

function reset() {
  state.controller?.abort(); state.seq++; clearTimeout(debounceT);
  setOutput(""); clearStatus(); state.detected = null; setLoading(false); renderLangs();
}

async function run(manual) {
  clearTimeout(debounceT);
  const text = el.input.value;
  if (!text.trim()) return reset();
  if (count(text) > MAX_CHARS) return showStatus(`Text is too long (${count(text).toLocaleString()} characters). The limit is ${MAX_CHARS.toLocaleString()}. Please shorten it.`);
  if (navigator.onLine === false) return showStatus("You appear to be offline. Reconnect and try again.", true);
  state.controller?.abort();
  const ctrl = (state.controller = new AbortController());
  const seq = ++state.seq;
  const { src, tgt } = state;
  clearStatus(); setLoading(true);
  try {
    const r = await translate(text, src, tgt, { signal: ctrl.signal });
    if (seq !== state.seq) return;
    setOutput(r.text);
    state.detected = src === "auto" ? r.detected : null;
    renderLangs();
    queueHistory({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ts: Date.now(), src, tgt, detected: state.detected, input: text, output: r.text }, manual);
  } catch (e) {
    if (e.code === "aborted" || seq !== state.seq) return;
    setOutput(""); showStatus(e.message || "Translation failed.", true);
  } finally {
    if (seq === state.seq) setLoading(false);
  }
}

// History: saved after a successful translation; typing-driven results wait until you pause.
function queueHistory(entry, manual) {
  clearTimeout(histT); state.pending = entry;
  if (manual) flushHistory(); else histT = setTimeout(flushHistory, 2500);
}
function flushHistory() {
  clearTimeout(histT);
  if (state.pending && state.saveHistory) store.addHistory(state.pending);
  state.pending = null;
}
addEventListener("pagehide", flushHistory);

function onInput() {
  renderCounter(); clearTimeout(debounceT);
  if (!el.input.value.trim()) return reset();
  if (state.instant) debounceT = setTimeout(() => run(false), 600);
}

// Searchable language picker (native <dialog>)
function pick(title, includeAuto, current) {
  return new Promise((resolve) => {
    const items = (includeAuto ? [{ code: "auto", name: "Detect language" }] : []).concat(LANGUAGES);
    let shown = [];
    const draw = () => {
      const q = el.pickerSearch.value.trim().toLowerCase();
      shown = items.filter((l) => !q || l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q));
      el.pickerList.textContent = "";
      if (!shown.length) { const li = document.createElement("li"); li.className = "empty"; li.textContent = "No languages found"; el.pickerList.append(li); return; }
      for (const l of shown) {
        const li = document.createElement("li"), b = document.createElement("button");
        b.type = "button"; b.className = "item"; b.textContent = l.name;
        if (l.code === current) b.setAttribute("aria-current", "true");
        b.onclick = () => { resolve(l.code); el.picker.close(); };
        li.append(b); el.pickerList.append(li);
      }
    };
    el.pickerTitle.textContent = title; el.pickerSearch.value = "";
    el.pickerSearch.oninput = draw;
    el.pickerSearch.onkeydown = (e) => { if (e.key === "Enter" && shown[0]) { e.preventDefault(); resolve(shown[0].code); el.picker.close(); } };
    el.picker.onclose = () => resolve(null);
    draw(); el.picker.showModal(); el.pickerSearch.focus();
  });
}
async function choose(which) {
  const code = await pick(which === "src" ? "Translate from" : "Translate to", which === "src", state[which]);
  if (!code) return;
  state[which] = code === "auto" ? code : normalizeCode(code);
  if (which === "src") state.detected = null;
  renderLangs(); persist();
  if (el.input.value.trim()) run(true);
}
function swap() {
  const newTgt = state.src === "auto" ? state.detected : state.src;
  if (!newTgt || !isSupported(newTgt)) return showStatus("Can't swap yet: the source language hasn't been detected or isn't selectable as a target.");
  const prev = state.tgt;
  state.src = prev; state.tgt = normalizeCode(newTgt); state.detected = null;
  if (state.result) el.input.value = state.result;
  renderLangs(); renderCounter(); persist();
  if (el.input.value.trim()) run(true);
}

async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch {}
  try { const ta = document.createElement("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0"; document.body.append(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; } catch { return false; }
}
function flash(btn, msg) { const o = btn.textContent; btn.textContent = msg; setTimeout(() => (btn.textContent = o), 1500); }

// History dialog
function renderHistory() {
  const h = store.loadHistory();
  el.historyList.textContent = "";
  el.clearHistoryBtn.hidden = !h.length;
  if (!h.length) { const li = document.createElement("li"); li.className = "empty"; li.textContent = "No saved translations yet."; el.historyList.append(li); return; }
  for (const e of h) {
    const li = document.createElement("li"); li.className = "hist";
    const b = document.createElement("button"); b.type = "button"; b.className = "item";
    const meta = document.createElement("span"); meta.className = "meta";
    const from = e.src === "auto" ? (e.detected ? languageName(e.detected) : "Auto") : languageName(e.src);
    meta.textContent = `${from} → ${languageName(e.tgt)} · ${new Date(e.ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`;
    const a = document.createElement("span"); a.className = "snip"; a.textContent = e.input;
    const c = document.createElement("span"); c.className = "snip meta"; c.textContent = e.output;
    b.append(meta, a, c);
    b.onclick = () => {
      state.controller?.abort(); state.seq++;
      state.src = e.src === "auto" || isSupported(e.src) ? e.src : "auto"; state.tgt = normalizeCode(e.tgt);
      state.detected = e.src === "auto" ? e.detected || null : null;
      el.input.value = e.input; setOutput(e.output); clearStatus(); setLoading(false);
      renderLangs(); renderCounter(); persist(); el.historyDlg.close();
    };
    const d = document.createElement("button"); d.type = "button"; d.className = "ghost sm"; d.textContent = "Delete"; d.setAttribute("aria-label", "Delete this history item");
    d.onclick = () => { store.removeHistory(e.id); renderHistory(); };
    li.append(b, d); el.historyList.append(li);
  }
}

// Wiring
el.input.addEventListener("input", onInput);
el.input.addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(true); } });
el.translateBtn.onclick = () => run(true);
el.srcBtn.onclick = () => choose("src");
el.tgtBtn.onclick = () => choose("tgt");
el.swapBtn.onclick = swap;
el.clearBtn.onclick = () => { el.input.value = ""; reset(); renderCounter(); el.input.focus(); };
el.pasteBtn.onclick = async () => {
  try { const t = await navigator.clipboard.readText(); if (!t) return showStatus("The clipboard is empty."); el.input.value = t; onInput(); el.input.focus(); }
  catch { showStatus("Couldn't read the clipboard. Your browser blocked it; paste into the box manually (Ctrl/Cmd+V)."); }
};
el.copyBtn.onclick = async () => flash(el.copyBtn, (await copyText(state.result)) ? "Copied" : "Copy failed");
el.instant.checked = state.instant;
el.instant.onchange = () => { state.instant = el.instant.checked; persist(); if (state.instant && el.input.value.trim()) run(false); };
el.themeBtn.onclick = () => { state.theme = { system: "light", light: "dark", dark: "system" }[state.theme]; applyTheme(); persist(); };
el.historyBtn.onclick = () => { flushHistory(); el.saveHistory.checked = state.saveHistory; renderHistory(); el.historyDlg.showModal(); };
el.saveHistory.onchange = () => { state.saveHistory = el.saveHistory.checked; persist(); };
el.clearHistoryBtn.onclick = () => { if (confirm("Delete all saved history from this device?")) { store.clearHistory(); renderHistory(); } };
el.privacyBtn.onclick = () => el.privacyDlg.showModal();
for (const d of document.querySelectorAll("dialog")) {
  d.addEventListener("click", (e) => { if (e.target === d || e.target.hasAttribute("data-close")) d.close(); });
}
addEventListener("online", clearStatus);
addEventListener("offline", () => showStatus("You are offline. Translation needs an internet connection."));

applyTheme(); renderLangs(); renderCounter();
