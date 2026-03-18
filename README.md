# Live Voice

This monorepo contains two complementary projects:

1. **Tour Guide Live Voice** – a live audio broadcast system (Flutter mobile + NestJS API + LiveKit SFU) where guides stream audio to listen-only groups.
2. **Offline GPS Map (React Native)** – a React Native app with voice recording, speech recognition, and an offline GPS map of Tashkent.

---

## Repository structure

```
live-voice/
├── apps/
│   ├── api/          # NestJS backend (auth, groups, sessions, WebSocket)
│   └── mobile/       # Flutter mobile app (guide + listener flows)
├── infra/
│   ├── docker-compose.yml   # Postgres + LiveKit + API
│   └── livekit.yaml
├── android/          # Android platform config for React Native app
├── ios/              # iOS platform config for React Native app
├── src/              # React Native app source
└── index.js          # React Native entry point
```

---

## Part 1 – Tour Guide Live Voice (Flutter + NestJS)

### Features

- **Guide** broadcasts live audio to a group via LiveKit WebRTC SFU.
- **Listeners** hear the guide in real-time (listen-only, mic never enabled).
- JWT authentication with guide/listener role selection at registration.
- Pre-tour checklist (DND/volume/headphones) for listeners.
- Real-time listener count via Socket.IO WebSocket gateway.
- Cryptographically secure group invite codes.

### Tech stack

| Layer | Technology |
|-------|-----------|
| Mobile | Flutter 3 + Riverpod |
| Backend | NestJS 10 + Knex + PostgreSQL 16 |
| Live Voice | LiveKit (WebRTC SFU) |
| Auth | JWT (email + password) |
| Real-time | Socket.IO WebSocket gateway |
| Deployment | Docker Compose (local) / Render (cloud) |

### Quick start

#### Prerequisites

- Docker >= 24 + Docker Compose v2
- Node.js >= 20 (for local API dev without Docker)
- Flutter >= 3.10 (for mobile)

#### 1. Configure environment

```bash
cp infra/.env.example infra/.env
# Edit infra/.env – set JWT_SECRET, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
```

#### 2. Start backend + database

```bash
cd infra
docker compose up --build
```

The API auto-runs migrations and seeds a demo guide + listener account on first start.

#### 3. Run Flutter app

```bash
cd apps/mobile
flutter pub get
flutter run
```

---

### Build and test the backend (NestJS) locally

Use this if you want to build or test the API without Docker.

#### Prerequisites

- Node.js >= 20 and npm >= 9
- PostgreSQL 16 running locally (or use the Docker Compose postgres service)

#### Install dependencies

```bash
cd apps/api
npm install
```

#### Configure environment

```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env – set DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET, LIVEKIT_* values
```

#### Run database migrations and seed

```bash
cd apps/api
npx knex --knexfile knexfile.ts migrate:latest
npx knex --knexfile knexfile.ts seed:run
```

#### Start the API in development mode (auto-reloads on file changes)

```bash
cd apps/api
npm run start:dev
```

The API will be available at `http://localhost:3000`.

#### Build for production

```bash
cd apps/api
npm run build        # compiles TypeScript → dist/
npm start            # runs dist/main.js
```

#### Run backend unit tests

```bash
cd apps/api
npm test
```

---

### Build the Flutter mobile app

#### Debug build (development)

```bash
cd apps/mobile
flutter pub get
flutter run            # connects to a running emulator or physical device
```

By default the app connects to `http://10.0.2.2:3000` (Android emulator → host machine).
Override the API URL at build time with `--dart-define`:

```bash
# Android emulator
flutter run --dart-define API_BASE_URL=http://10.0.2.2:3000

# iOS simulator
flutter run --dart-define API_BASE_URL=http://localhost:3000

# Physical device on the same Wi-Fi (replace with your machine's IP)
flutter run --dart-define API_BASE_URL=http://192.168.1.100:3000

# Deployed backend
flutter run --dart-define API_BASE_URL=https://your-api.onrender.com
```

#### Android release APK

```bash
cd apps/mobile
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

#### Android App Bundle (recommended for Play Store)

```bash
cd apps/mobile
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

#### iOS release (macOS only)

```bash
cd apps/mobile
flutter build ipa --release
# Output: build/ios/ipa/*.ipa  (requires Apple Developer account)
```

#### Run Flutter tests

```bash
cd apps/mobile
flutter test
```

---

## Part 2 – Offline GPS Map (React Native)

### Features

- **Voice recording** – start and stop audio recording sessions, list and delete saved recordings.
- **Speech-to-text** – real-time transcription via `@react-native-community/voice`.
- **Audio utilities** – duration formatting, filename generation, transcript validation.
- 🗺 **Offline map** – OpenStreetMap tiles for Tashkent (zoom 10–17) served from local storage – no internet required.
- 📍 **GPS tracking** – Continuous position tracking using the device's hardware GPS chipset.
- 🛤 **Track recording** – Records the full route as a polyline drawn on the map.
- 🎯 **Accuracy ring** – Visualises GPS horizontal accuracy around the user's position.

### Project structure

```
src/
├── services/
│   ├── VoiceRecorderService.js   # Recording lifecycle management
│   ├── SpeechRecognitionService.js # Speech-to-text wrapper
│   ├── GpsTrackingService.js     # Singleton GPS watcher
│   └── OfflineTileService.js     # Offline tile file management
├── utils/
│   ├── audioHelpers.js           # Pure helper functions
│   └── tashkentConstants.js      # Geographic constants for Tashkent
├── components/
│   ├── OfflineMapView.js         # MapView with offline UrlTile layer
│   └── TrackingControls.js       # Start/Stop/Clear GPS panel
├── hooks/
│   └── useGpsTracking.js         # React hook wrapping GpsTrackingService
├── screens/
│   └── OfflineMapScreen.js       # Top-level map screen
├── __mocks__/                    # Jest mocks for native modules
└── __tests__/                    # Unit test suites
```

---

### Getting started (React Native app)

#### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18 LTS |
| npm | 9 |
| React Native CLI | 0.73 |
| Android Studio / Xcode | latest stable |

#### Install dependencies

```bash
npm install
```

---

## How to test the program

### Run all unit tests

```bash
npm test
```

Jest runs every file matching `src/__tests__/**/*.test.js` using the React Native
preset. No device, emulator, or internet connection is required – all native
modules are replaced by lightweight mocks in `src/__mocks__/`.

Expected output:

```
 PASS  src/__tests__/audioHelpers.test.js
 PASS  src/__tests__/SpeechRecognitionService.test.js
 PASS  src/__tests__/VoiceRecorderService.test.js
 PASS  src/__tests__/GpsTrackingService.test.js
 PASS  src/__tests__/OfflineTileService.test.js
 PASS  src/__tests__/tashkentConstants.test.js

Test Suites: 6 passed, 6 total
Tests:       100 passed, 100 total
```

### Run a single test file

```bash
npx jest src/__tests__/VoiceRecorderService.test.js
npx jest src/__tests__/SpeechRecognitionService.test.js
npx jest src/__tests__/audioHelpers.test.js
npx jest src/__tests__/GpsTrackingService.test.js
npx jest src/__tests__/OfflineTileService.test.js
npx jest src/__tests__/tashkentConstants.test.js
```

### Run tests whose name matches a pattern

```bash
# Run only tests related to "startRecording"
npx jest --testNamePattern="startRecording"

# Run only tests related to "formatDuration"
npx jest --testNamePattern="formatDuration"
```

### Watch mode (re-runs tests on file save)

```bash
npx jest --watch
```

### Coverage report

```bash
npx jest --coverage
```

---

## Test suites explained

### `VoiceRecorderService.test.js`

Tests the full lifecycle of the `VoiceRecorderService`:

| Scenario | What is verified |
|----------|-----------------|
| Initial state | `isRecording()` is `false`, no current file, empty list |
| `startRecording` | Sets recording flag, returns correct path, creates directory when missing, throws on duplicate start or empty filename |
| `stopRecording` | Clears recording flag, returns saved path, adds entry to list, throws when not recording |
| `deleteRecording` | Calls `fs.unlink`, removes entry from list, throws for missing files |
| `getRecordings` | Returns a defensive copy of the internal list |

### `SpeechRecognitionService.test.js`

Tests the speech-to-text wrapper:

| Scenario | What is verified |
|----------|-----------------|
| Initial state | Not listening, empty transcript |
| `startListening` | Sets listening flag, passes locale to Voice, defaults to `en-US`, throws when already active |
| `stopListening` | Clears listening flag, calls `Voice.stop`, throws when not active |
| Speech results | Updates `lastTranscript`, notifies subscribers, picks first alternative, ignores empty results |
| Speech errors | Clears listening flag, forwards error to subscribers |
| subscribe / unsubscribe | Unsubscribed callbacks are not called; multiple simultaneous subscribers work correctly |
| `destroy` | Calls `Voice.destroy`, clears listening flag |

### `audioHelpers.test.js`

Tests pure utility functions:

| Function | Cases covered |
|----------|---------------|
| `formatDuration` | `0 s`, `65 s`, `3600 s`, fractional seconds (truncation), negative/NaN/non-number (throws) |
| `generateRecordingFilename` | Fixed date produces deterministic output, no colons in result, correct prefix, defaults to now |
| `isValidTranscript` | Non-empty string, empty string, whitespace-only, null, undefined, number |

### `GpsTrackingService.test.js`

Tests the singleton GPS tracking service:

| Scenario | What is verified |
|----------|-----------------|
| Initial state | `isTracking` is `false`, empty track, `currentPosition` is `null` |
| `startTracking` | Sets tracking flag, calls `Geolocation.watchPosition`, idempotent on duplicate calls |
| `stopTracking` | Clears tracking flag, calls `Geolocation.clearWatch`, idempotent when not started |
| Position updates | Stores fix in track, updates `currentPosition`, notifies subscribers, discards inaccurate fixes (>50 m) |
| Unsubscribe | Removed callback is not called after `unsub()` |
| Error handling | GPS failures are forwarded to error subscribers as `Error` instances |
| `clearTrack` | Resets track to empty without stopping the watcher |

### `OfflineTileService.test.js`

Tests offline map tile utilities:

| Function / Scenario | What is verified |
|---------------------|-----------------|
| `lonToTileX` | Correct tile X for 0°, −180°, and Tashkent longitude at zoom 10 |
| `latToTileY` | Correct tile Y for Tashkent latitude; always non-negative |
| `getLocalTileUri` | Returns `null` for missing tiles, `file://` URI for present tiles, `null` on I/O error |
| `getOfflineTileUrlTemplate` | Contains `{z}`, `{x}`, `{y}` placeholders; starts with `file://` |
| `verifyTileCoverage` | Reports `complete=false` when tiles are missing; `complete=true` when all present; `missingCount + present = total` |

### `tashkentConstants.test.js`

Tests the geographic constant values for Tashkent:

| Constant | What is verified |
|----------|-----------------|
| `TASHKENT_CENTER` | Latitude and longitude fall within city boundaries |
| `TASHKENT_BOUNDS` | North > South, East > West; center point is contained within bounds |
| `DEFAULT_DELTA` | Both `latitudeDelta` and `longitudeDelta` are positive |
| `ZOOM_LEVELS` | City < District < Street < Building (ascending order) |
| `OFFLINE_TILE_ZOOM_RANGE` | `min < max`; min ≥ 10; max ≤ 20 |

---

## Run on a device / emulator

### Android

```bash
npm run android
```

### iOS (macOS only)

```bash
cd ios && pod install && cd ..
npm run ios
```

### Start Metro bundler separately

```bash
npm start
```

---

## Lint

```bash
npm run lint
```

---

## Mock architecture

Because `VoiceRecorderService` and `SpeechRecognitionService` accept their
dependencies as constructor arguments (dependency injection), tests pass plain
JavaScript objects instead of real native modules. This means:

- **No device or emulator is needed** to run the test suite.
- **Failures are deterministic** – tests control every async event.
- The mocks in `src/__mocks__/` are only loaded when the real package is imported
  from application code; they are not used by the unit tests directly.

### Simulating events in tests

The `voice.js` mock exposes two helper methods:

```js
voice._simulateSpeechResults(['hello world']);  // fires onSpeechResults
voice._simulateSpeechError({ code: '7' });       // fires onSpeechError
```

Use these inside any test that needs to trigger the service's event handlers.
---

## Offline GPS Map (Tashkent)

### GPS Tracking

GPS tracking works **entirely offline** using the device's hardware GPS chipset.
Fixes with horizontal accuracy worse than **50 m** are automatically discarded.

#### Required Permissions

| Platform | Permission |
|---|---|
| Android | `ACCESS_FINE_LOCATION`, `ACCESS_BACKGROUND_LOCATION` |
| iOS | `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription` |

### Example: GPS subscription

```js
import GpsTrackingService from './src/services/GpsTrackingService';

GpsTrackingService.startTracking();
const unsub = GpsTrackingService.onLocationUpdate(point => {
  // { latitude, longitude, accuracy, speed, heading, altitude, timestamp }
  console.log(point.latitude, point.longitude);
});
// later: unsub(); GpsTrackingService.stopTracking();
```

### Offline Tile Coverage (Tashkent)

| Bound | Value |
|---|---|
| West  | 69.1° E |
| South | 41.2° N |
| East  | 69.45° E |
| North | 41.4° N |
| Zoom  | 10 – 17 |

Tiles must be placed under `android/app/src/main/assets/tiles/` before building,
following the standard OSM `{z}/{x}/{y}.png` convention.

The `geolocation.js` mock exposes helper methods for GPS tests:

```js
Geolocation._simulatePosition({ coords: { latitude: 41.3, longitude: 69.24, accuracy: 10 } });
Geolocation._simulateError({ code: 1, message: 'Permission denied' });
```
