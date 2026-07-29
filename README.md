# Aftershock

Aftershock is an Expo and React Native earthquake preparedness application. It
combines preparedness lessons, emergency information, local earthquake data,
news, account management, and an AI guide.

## Getting started

Requirements:

- Node.js
- npm
- Expo-compatible iOS, Android, or web environment

Install dependencies and start the development server:

```sh
npm install
npm start
```

Other development commands:

```sh
npm run ios
npm run android
npm run web
npm run lint
npm test
npm run check
```

`npm run check` runs both lint and the unit-test suite.

## Environment configuration

Create a local `.env` file with the Firebase configuration expected by
`src/services/firebase/firebaseConfig.js`:

```text
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=
```

The production backend defaults to the deployed Aftershock API. Override it
for local development with:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

Do not commit `.env` files or credentials.

## Architecture

Application code lives under `src`:

```text
src/
├── application/     application composition and navigation
├── components/      reusable application-wide components
├── constants/       route, storage, and runtime configuration
├── features/        screens, data, components, and styles by feature
├── hooks/           application-wide hooks
├── services/        API, Firebase, and persistence boundaries
├── theme/           colors, typography, and shared styles
└── utils/           pure utility functions
```

Feature screens should coordinate rendering and user interaction. Network
requests belong in `src/services/api`, persistent data access belongs in
`src/services/storage`, and reusable feature UI belongs in that feature's
`components` directory.

The root `App.js` is intentionally limited to re-exporting the application
entry point.

## Data and storage

Canonical AsyncStorage keys are defined in
`src/constants/storageKeys.js`. A startup migration copies values from legacy
key variants into their canonical keys without deleting old data.

API calls use the shared client in `src/services/api/client.js`. This provides
consistent JSON parsing and error objects while keeping endpoint-specific
payloads in separate modules.

## Testing

The initial unit suite covers:

- Earthquake timestamp parsing
- Earthquake event fingerprinting
- Supported earthquake response shapes
- Stored JSON and plain-text parsing

Add pure domain tests under `tests` with the `.test.mjs` suffix.

## Development conventions

- Navigable component filenames use the `Screen` suffix.
- React components use PascalCase.
- Route and storage strings should come from the constants modules.
- Avoid direct `fetch` calls outside API services.
- Avoid logging passwords, contacts, medical information, plans, or exported
  account data.
- Run `npm run check` before submitting changes.

## Security note

The existing account flows use custom password hashes stored in Firestore.
Migrating those flows to Firebase Authentication, together with a review of
Firestore security rules, should be completed before treating the account
system as production-ready.
