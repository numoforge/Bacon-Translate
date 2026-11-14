# Development and deployment

## Requirements

- A modern browser for running the app.
- Node.js for running the automated tests.
- No package installation or frontend build step is required by the current application.

## Get the source

Clone the repository:

```bash
git clone https://github.com/numoforge/Bacon-Translate.git
cd Bacon-Translate
```

Alternatively, download the repository ZIP from GitHub and extract it.

## Run locally

Because the app uses native JavaScript modules, serve the repository through a local HTTP server rather than opening `index.html` as a `file://` URL.

With Python:

```bash
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

Any equivalent static HTTP server can be used. There is no compile or bundling command.

## Run tests

```bash
npm test
```

The package script runs Node's built-in test runner against `tests/*.test.mjs`. The suite mocks network responses. It checks chunking, response parsing, language helpers, caching, and representative error paths. It does not test the live Google endpoint.

## Repository layout

See the project tree in the main [README](../README.md). Keep the relative paths used by `index.html` and the ES module imports intact when moving files.

## Deploy with GitHub Pages

The project is a static site and is intended to be served from the repository root:

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select `main` and `/(root)`.
4. Save and wait for GitHub Pages to finish publishing.
5. Verify the public URL: [https://numoforge.github.io/Bacon-Translate/](https://numoforge.github.io/Bacon-Translate/).

Changes to files on the published branch can trigger a new Pages deployment. Do not move `index.html`, `css/`, or `js/` without updating and checking their references.

## Before submitting changes

- Keep the application static and avoid introducing secrets into client-side code.
- Run `npm test`.
- Test the app at mobile and desktop viewport sizes.
- If changing translation requests, verify behavior with mocks and, where possible, perform a clearly identified manual live-service check.
- Review privacy implications whenever changing network requests or local storage.
- Do not claim that mocked tests prove Google's live endpoint is available.
