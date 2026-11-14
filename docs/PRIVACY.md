# Privacy and data handling

## Short version

Bacon Translate does not operate an application backend or account system. However, **text submitted for translation is sent from your browser to Google's translation endpoint**. Do not use the app for passwords, private keys, financial information, confidential business material, personal records, or other sensitive content.

## What is sent to Google

For each translation request, the browser sends the text (URL-encoded in the request) to:

`https://translate.googleapis.com/translate_a/single`

The app uses Google's unofficial, undocumented `client=gtx` web endpoint. Google receives the text so it can process the translation. As with ordinary network requests, Google may also receive request metadata such as the IP address and browser/network information.

The app configures requests with `credentials: "omit"` and `referrerPolicy: "no-referrer"`. These settings do not make the translation anonymous and do not prevent the destination service from seeing the request.

## What Bacon Translate stores

The app has no application server and does not receive translated text through a project-controlled backend.

When enabled, translation history is stored in the browser's `localStorage` on the current device/profile. It can contain the original text, translated text, language codes, and a timestamp. History is limited to the most recent 50 entries.

Preferences such as selected languages, instant-translation setting, history-saving preference, and theme are also stored locally.

You can:
- Turn off history saving in the app.
- Delete an individual history item.
- Clear all saved history from the History dialog.
- Clear the site's browser storage through your browser settings.

Local storage is not encrypted by this application. Anyone with access to the same browser profile may be able to inspect it.

## Other services

The site is hosted by GitHub Pages. GitHub may process ordinary hosting requests and maintain service logs under its own policies. The project does not add an analytics provider, advertising tracker, or application cookies.

## Third-party policies and limitations

Google's endpoint is unofficial and undocumented. Google may change its behavior, restrict access, or process request data under its own applicable terms and privacy practices. Review Google's current [Privacy Policy](https://policies.google.com/privacy) and [Terms of Service](https://policies.google.com/terms).

This document describes the application's current implementation; it is not a legal privacy guarantee or a statement about Google's internal retention practices.

## Practical guidance

- Avoid translating sensitive or confidential information.
- Use the app only when you are comfortable sending the text to Google.
- Disable history saving on shared devices and clear local history when finished.
- For a production or regulated use case, evaluate an official translation service and an appropriately secured backend with a reviewed privacy policy.
