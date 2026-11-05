# Free Will Lab

A mobile app for iPhone and Android that lets you test your own free will with three experiments from real research, plus a summary of the evidence.

| Tab | What it does |
| --- | --- |
| **Oracle** | Tap Left or Right as randomly as you can while a machine predicts each tap from your past patterns (based on Scott Aaronson's oracle). Most people are predicted 60–70% of the time. |
| **Libet Clock** | A re-run of Benjamin Libet's 1983 experiment. Tap when you feel the urge, then mark where the dot was when the urge began. Your average is plotted against Libet's EEG results. |
| **Your View** | Eight questions place you on a map of positions (compatibilist, libertarian, skeptic, revisionist), compared with the 2020 PhilPapers survey of philosophers. |
| **Evidence** | Thirteen key experiments and arguments from 1677 to 2023, each with the reason it didn't settle the question. |

Results are saved on the device, and the app gives haptic feedback when the machine predicts you.

## Run it on your phone

1. Install **Expo Go** from the App Store or Google Play.
2. On a computer with Node.js 20+:

```bash
npm install
```

```bash
npx expo start
```

3. Scan the QR code with your phone's camera (iPhone) or with Expo Go (Android).

## Build a standalone app

The app runs in Expo Go as-is. To publish to the App Store or Google Play, build with EAS (needs a free Expo account):

```bash
npx eas-cli@latest build --platform all
```

Before publishing, change `ios.bundleIdentifier` and `android.package` in `app.json` to identifiers you own.

## Project layout

- `src/app/` holds the screens: `_layout.tsx` (native tab bar), `index.tsx` (Oracle), `libet.tsx`, `stance.tsx` and `evidence.tsx`.
- `src/lib/` holds the logic: `oracle.ts` (the prediction model), `stance.ts` (quiz scoring), `storage.ts` (on-device saving) and `haptics.ts`.
- `src/data/evidence.ts` holds the research summaries.
- `src/theme.ts` holds the colours (light and dark) and fonts.

Built with Expo SDK 58, Expo Router native tabs, react-native-svg, expo-haptics and AsyncStorage.
