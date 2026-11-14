# 🥓 Bacon Translate

A fast, clean web translator powered by **Google Translate**. Static site for GitHub Pages: no backend, no accounts, no API keys.

Live site (once Pages is enabled): https://numoforge.github.io/Bacon-Translate/

## Features
Auto source-language detection · 100+ languages · instant translation while typing + manual Translate button · swap · searchable language pickers · copy/paste/clear · character counter (5,000 limit) · local history (last 50, can be disabled/deleted) · light/dark/auto theme · responsive layout · loading states and clear errors · long text split into safe chunks.

## Privacy
- **Text you translate is sent to Google Translate**, plus your IP address and browser details as with any web request. No referrer is sent.
- We run no server and never receive your text.
- History and preferences stay in your browser's `localStorage`.
- No analytics, cookies, or secrets in the code. GitHub Pages may keep standard server logs.

## Google Translate limitations
The official Cloud Translation API needs an API key, which cannot be kept secret in frontend code, so it is not used. The app calls Google's **unofficial, keyless web endpoint** (`translate.googleapis.com/translate_a/single?client=gtx`):
- Undocumented and unsupported; it can change, be rate-limited or blocked at any time.
- No SLA; use may be subject to Google's Terms of Service. Suited to personal/hobby use.
- GET-based, so text is chunked (≤3,000 URL-encoded characters per request).
- Failures (including HTTP 429) are shown as errors. There is no dictionary fallback and no fake translation.

For production, call the official API from your own backend.

## Structure
`index.html` · `css/styles.css` · `js/languages.js` · `js/translate.js` (chunking, requests, timeout, retry, errors) · `js/storage.js` · `js/app.js` · `tests/`

## Tests
`npm test` runs unit tests with a mocked `fetch` (they do not contact Google).

## Deploy
Settings → Pages → Deploy from a branch → `main` / `(root)`.

## License
MIT
