# Contributing

Thank you for considering a contribution to Bacon Translate.

## Ways to contribute

- Report reproducible bugs.
- Improve documentation or accessibility.
- Suggest focused interface improvements.
- Submit fixes with tests where practical.

## Before opening an issue

- Check whether the issue has already been reported.
- Include the browser/device and steps needed to reproduce the problem.
- Describe expected and actual behavior.
- Include console or network errors when relevant.
- Remove private information from screenshots and logs. Never submit real translation text if it is personal or confidential.

## Pull requests

1. Keep changes focused and explain the user-facing reason.
2. Preserve the static-site architecture unless a design change is discussed first.
3. Do not add API keys, credentials, private data, or secrets to client-side files.
4. Update documentation when behavior, privacy, or setup instructions change.
5. Run `npm test` before submitting.
6. Manually check affected UI behavior on a narrow/mobile viewport and a desktop viewport.

## Translation service caution

The current translation integration uses Google's unofficial, undocumented keyless web endpoint. Contributions must not describe it as the official Google Cloud Translation API or promise stable availability. Any change that sends additional data to a third party must be documented clearly.

## License

By contributing, you agree that your contributions are provided under the repository's MIT License.
