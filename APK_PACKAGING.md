# Packaging LazyMan's Tallysheet as an Android APK

Your site at https://wetally.org is already a PWA. This document covers turning it into a real `.apk` you can sideload or publish to Play Store, using a Trusted Web Activity (TWA).

## Easy path — PWABuilder (recommended)

1. Deploy the updated files (index.html, manifest.json, service-worker.js, all icon PNGs) to wetally.org. Verify https://wetally.org/manifest.json loads.
2. Go to https://www.pwabuilder.com and enter `https://wetally.org`. It will score your PWA and offer to fix anything missing.
3. Click "Package for stores" → "Android". You'll be asked for:
   - **Package ID** — use something like `org.wetally.tallysheet` (must be unique on Play Store; can't change later).
   - **App name / launcher name** — "Tallysheet" works.
   - **Signing key** — choose "create new", let PWABuilder generate one. Save the keystore file AND the password somewhere safe. If you lose them, you can never push updates to the same app.
4. Download the zip. Inside you'll get:
   - `app-release-signed.apk` — sideload this on any Android device (Settings → enable Install Unknown Apps).
   - `app-release-bundle.aab` — upload this to Play Store.
   - `assetlinks.json` — replace the one in this folder with PWABuilder's version, then upload to wetally.org at `/.well-known/assetlinks.json`.

## Without Digital Asset Links

The APK still runs. But it shows a "Powered by Chrome" header bar with the URL. Hosting assetlinks.json at `https://wetally.org/.well-known/assetlinks.json` removes that and makes it look fully native.

## Updating

For a TWA, you don't push APK updates for content changes. You just deploy new HTML/JS to wetally.org and the next time the user opens the app it fetches the latest version. You only re-publish the APK if you change the manifest (icons, name, theme color) or the underlying Android wrapper version.

## Play Store extras

- $25 one-time Google Play Developer account fee.
- Privacy policy URL (required — even though all data is local, the listing categories you'll pick are health-adjacent). A short page on wetally.org explaining "all data stays on the device, no server, GA4 analytics only" is enough.
- 2 screenshots minimum, 1 feature graphic (1024x500).
- Content rating questionnaire — answer honestly; this won't be rated higher than "Everyone".

## iOS

There's no equivalent of TWA on iOS. Two options:

1. **Add to Home Screen via Safari** (free). Users tap Share → Add to Home Screen. Works as a PWA but isn't on the App Store.
2. **Capacitor wrapper + Apple Developer Program** ($99/year). Capacitor wraps your web app in a native iOS shell that can be submitted to the App Store. Run `npm i -g @capacitor/cli`, `npx cap init`, `npx cap add ios`, then open the generated Xcode project. More involved than TWA.

Given most clinic users are on Android in Zambia, "Add to Home Screen" may be enough for the iOS minority.
