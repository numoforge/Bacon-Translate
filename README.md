# 🥓 Bacon Translate

**A lightweight, responsive multilingual translator for the web.**

Bacon Translate is a static web application that helps you translate text with automatic source-language detection, searchable language selectors, translation history, and a simple interface. It is hosted on GitHub Pages and does not require an account, application backend, or API key.

<p align="center">
  <a href="https://numoforge.github.io/Bacon-Translate/"><strong>🌐 Open Bacon Translate</strong></a>
  ·
  <a href="https://github.com/numoforge/Bacon-Translate/issues">Report a problem</a>
</p>

> **Important:** The app currently uses Google's unofficial, undocumented, keyless web translation endpoint. It is not the official Google Cloud Translation API and is not guaranteed to remain available. Read [Privacy](docs/PRIVACY.md) and [Known limitations](#translation-service-and-limitations) before using it for sensitive or important content.

## Features

- Automatic source-language detection
- More than 100 language options, based on the language list bundled with the app
- Instant translation while typing, with a manual **Translate** action
- Searchable source and target language selectors
- Language swapping after the source language is known
- Copy, paste, and clear controls
- A 5,000-character input limit
- Long-text chunking that preserves the original text while splitting requests at safe boundaries
- Local translation history (up to 50 entries), with controls to disable saving, delete individual entries, or clear all history
- Light, dark, and system theme options
- Responsive layout, loading feedback, and actionable error messages

## Try it

Visit **[Bacon Translate](https://numoforge.github.io/Bacon-Translate/)**. Enter text, choose the target language, and either leave instant translation enabled or use the Translate button.

## How it works

Bacon Translate is a client-side static site:

1. The browser loads the HTML, CSS, and JavaScript served by GitHub Pages.
2. The app validates the input length and splits longer text into request-sized chunks.
3. Each chunk is sent from the browser to Google's unofficial keyless translation endpoint over HTTPS.
4. The app combines the returned translated segments and displays the result.
5. Preferences and optional history are stored in the browser's `localStorage`.

There is no Bacon Translate application server. The project does not receive or store the text being translated.

See [Architecture](docs/ARCHITECTURE.md) for implementation details.

## Translation service and limitations

The current implementation calls:

```text
https://translate.googleapis.com/translate_a/single
```

using Google's web-client parameters. This endpoint is unofficial, undocumented, and unsupported for use as a stable public API. Google may change it, restrict requests, rate-limit traffic, or block access without notice. The app cannot guarantee translation availability or quality.

The official Google Cloud Translation API is not used. Its credentials must not be embedded in a public browser application; a production integration would normally require a secured backend and appropriate API credentials.

- Request text is URL-encoded and split into chunks of at most 3,000 encoded characters.
- The app limits the full input to 5,000 characters.
- Requests have a timeout and limited retry behavior for transient failures.
- Rate-limit and other service errors are surfaced to the user; the app does not fabricate fallback translations.

## Privacy

Translation text is sent directly from your browser to Google for processing. Google receives the request and may receive ordinary request metadata such as your IP address and browser/network information. The app sends requests without browser credentials and uses a no-referrer policy.

Bacon Translate itself has no application backend, account system, analytics integration, or server-side translation history. Preferences and saved history remain in your browser's local storage on that device. Clearing browser site data can remove them.

**Do not submit passwords, private keys, financial details, personal records, or other sensitive information.** Review the full [Privacy and data handling documentation](docs/PRIVACY.md).

## Run locally

You only need a modern browser and a local static web server.

1. Clone or download this repository.
2. Serve the repository root with any simple static HTTP server.
3. Open the local address provided by that server.

For example, if Python is installed:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

The project uses native browser JavaScript modules and has no build step or runtime package dependencies.

## Tests

Node.js is required to run the automated unit tests:

```bash
npm test
```

The tests cover language-code handling, response parsing, chunk boundaries, multi-chunk translation behavior, caching, and representative error cases. Translation requests are mocked in the tests; **running the test suite does not verify Google's live service**.

## Deploy to GitHub Pages

The repository is configured for a static deployment from the `main` branch and repository root:

1. Open **Settings → Pages**.
2. Select **Deploy from a branch**.
3. Choose branch `main` and folder `/(root)`.
4. Save and wait for GitHub Pages to publish the site.

The public site is [https://numoforge.github.io/Bacon-Translate/](https://numoforge.github.io/Bacon-Translate/).

## Project structure

```text
.
├── index.html                 # Application markup and dialogs
├── css/
│   └── styles.css             # Responsive layout and themes
├── js/
│   ├── app.js                 # UI state, events, and interaction
│   ├── languages.js           # Supported language codes and labels
│   ├── storage.js             # Local preferences and history
│   └── translate.js           # Translation requests, parsing, and chunking
├── tests/
│   └── translate.test.mjs     # Node.js unit tests
├── docs/
│   ├── ARCHITECTURE.md        # Application design and request flow
│   ├── DEVELOPMENT.md         # Local development and deployment
│   └── PRIVACY.md             # Data handling and privacy notes
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── README.md
```

## Contributing

Bug reports, documentation improvements, and focused pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing. Do not include real private text or personal data in bug reports.

## License

This project is distributed under the [MIT License](LICENSE).

---

Bacon Translate is an independent community project and is not affiliated with or endorsed by Google.
