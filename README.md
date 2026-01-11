**Asha Health**

A lightweight Expo-based mobile application for community health workers (ASHA). This repository contains a TypeScript React Native app using Expo SDK and SQLite for offline storage, plus basic sync utilities to a remote server.

**Quick Summary**
- **Language:** TypeScript (+ some JS files)
- **Framework:** React Native (Expo)
- **Expo SDK:** ~54 (see `package.json` / `app.json`)
- **Local DB:** `expo-sqlite`
- **State / Context:** `src/context` contains `AuthContext` and `LanguageContext`

**Project Status**
- This is an app skeleton with screens for auth, patient list/forms, analysis, guidance and settings. Core features include offline storage, periodic sync, and internationalization support.

**Repository Layout**
- `App.tsx`: Root app entry and navigation (stack-based).
- `app.json`, `eas.json`: Expo and EAS configuration.
- `package.json`: Scripts and dependencies.
- `src/`
  - `components/`: Reusable UI components (e.g., `FloatingLanguageButton.tsx`).
  - `context/`: `AuthContext.js`, `LanguageContext.tsx` for auth and language state.
  - `db/`: `sqlite.ts` -- DB initialization and helpers.
  - `screens/`: App screens (Landing, Login, Register, PatientList, PatientForm, Analysis, Guidance, Settings, Splash, etc.).
  - `services/`: `sync.ts` for background/connectivity sync logic.
  - `i18n.ts`: localization setup.
- `assets/`: images, icons, fonts.

**Prerequisites**
- Node.js (LTS recommended, e.g., 18+).
- Yarn or npm.
- Expo CLI (optional globally): `npm install -g expo-cli` (you can also use `npx expo`).
- For building via EAS, install and configure `eas-cli` (see Expo docs).

**Install & Run (Development)**
Open a PowerShell terminal at the repository root and run:

```powershell
npm install
# or
yarn install

# start the Expo dev server
npm run start
# or
yarn start

# to run on Android emulator/device
npm run android

# to run on iOS simulator (macOS only)
npm run ios
```

Notes:
- The `start`, `android`, `ios`, and `web` scripts are defined in `package.json` and map to `expo start` commands.
- If you use EAS for production builds, follow `eas.json` configuration and run `eas build` after installing and logging into EAS.

**Database & Sync**
- The app initializes a local SQLite database via `src/db/sqlite.ts` on startup (`initDatabase()` in `App.tsx`).
- Background and connectivity-triggered sync are provided by `src/services/sync.ts` (see `attemptSync`, `startConnectivitySync`, `stopConnectivitySync`).

**TypeScript**
- TypeScript config extends `expo/tsconfig.base`. Strict mode is enabled in `tsconfig.json`.

**Key Files to Review**
- `App.tsx` — root navigation and bootstrapping (DB init, sync start).
- `src/context/AuthContext.js` — authentication state and provider.
- `src/db/sqlite.ts` — schema and DB helpers.
- `src/services/sync.ts` — sync logic and network handling.

**Adding/Updating Dependencies**
- Prefer to follow Expo-compatible package versions. Test any native module updates on a device or emulator.

**Testing & Debugging**
- Use the Expo dev tools (opened by `expo start`) to run on simulators/devices, inspect logs, and open the app in a browser.
- For native-level debugging or custom native modules, use EAS/Dev Client workflows.

**Contributing**
- Fork, branch, and open a pull request with small focused changes.
- Keep code style consistent with existing files (TypeScript strict, minimal inline comments).

**License**
- No license file included. Add a `LICENSE` if you intend to open-source this project.

**Next Steps / Suggestions**
- Add a `CONTRIBUTING.md` with development conventions.
- Add unit / integration tests (Jest + React Native Testing Library) for key components and services.
- Add CI checks (lint, typecheck, unit tests) and EAS build validation.

----
File generated automatically: `README.md` — adjust project-specific details (server URLs, environment variables) as needed.
