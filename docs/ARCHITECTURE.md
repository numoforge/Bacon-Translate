# Architecture

## Overview

Bacon Translate is a static, browser-based application. GitHub Pages serves the files; there is no application server, database, build pipeline, or runtime package dependency.

The browser loads `index.html`, which references `css/styles.css` and the JavaScript entry point `js/app.js`. JavaScript is organized as native ES modules.

## Modules

| File | Responsibility |
| --- | --- |
| `index.html` | Accessible page structure, controls, and dialog markup |
| `css/styles.css` | Responsive layout, component styling, and theme variables |
| `js/app.js` | UI state, event handlers, language selection, translation lifecycle, and history UI |
| `js/languages.js` | Supported language code/name list, aliases, normalization, and lookup helpers |
| `js/translate.js` | Endpoint requests, chunking, response parsing, timeout/retry behavior, and in-memory result cache |
| `js/storage.js` | Browser-local preferences and translation history |
| `tests/translate.test.mjs` | Node.js unit tests for translation helpers and representative request behavior |

## Translation flow

1. The user enters text or pastes it into the input field.
2. The UI enforces the 5,000-character input limit.
3. When instant translation is enabled, the app waits for a short typing debounce; the user can also request translation manually.
4. The translation module splits the text into chunks whose URL-encoded text is no larger than 3,000 characters. It prefers paragraph/newline and sentence boundaries, then falls back to character-level splitting for unusually long segments. Joining the chunks preserves the original input.
5. Each non-whitespace chunk is requested from `https://translate.googleapis.com/translate_a/single` using the `client=gtx` web-client parameters, source code, target code, and text.
6. The response parser joins translated segments and normalizes the detected source-language code when available.
7. The UI joins chunk results, displays the translation, and queues history if history saving is enabled.

The endpoint is Google's unofficial, undocumented keyless web endpoint. It is not the official Cloud Translation API. Its behavior and availability can change without notice.

## Request behavior

- HTTPS requests are made from the user's browser.
- Browser credentials are omitted and the request uses `no-referrer`.
- Each request has a 15-second timeout.
- Transient server, network, or timeout failures may be retried once.
- HTTP 429 is surfaced as a rate-limit error rather than silently retried.
- An abort signal is used to cancel superseded requests.
- Successful results are cached in memory for the current page session (up to 100 entries).

## State and persistence

The UI keeps current interaction state in memory. Preferences and optional history are persisted by `js/storage.js` in `localStorage`:

- Preferences key: `bacon.prefs.v1`
- History key: `bacon.history.v1`
- History is capped at 50 entries.
- The app avoids adding a duplicate of the most recent entry when input and language pair match.
- Users can disable history saving, delete one entry, or clear all history.

This storage is scoped to the browser profile and site origin. It is not synchronized between devices.

## Tests

Run `npm test` with Node.js. The tests use mocked fetch responses and validate helper behavior; they do not make requests to Google's live endpoint and do not certify production availability.
