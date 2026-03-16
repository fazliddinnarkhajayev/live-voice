# Live Voice

A React Native app combining voice recording, speech recognition, and an offline GPS map of Tashkent.

---

## Features

- **Voice recording** – start and stop audio recording sessions, list and delete saved recordings.
- **Speech-to-text** – real-time transcription via `@react-native-community/voice`.
- **Audio utilities** – duration formatting, filename generation, transcript validation.
- 🗺 **Offline map** – OpenStreetMap tiles for Tashkent (zoom 10–17) served from local storage – no internet required.
- 📍 **GPS tracking** – Continuous position tracking using the device's hardware GPS chipset.
- 🛤 **Track recording** – Records the full route as a polyline drawn on the map.
- 🎯 **Accuracy ring** – Visualises GPS horizontal accuracy around the user's position.

---

## Project structure

```
live-voice/
├── index.js                        # React Native entry point
├── package.json
├── babel.config.js
└── src/
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
    │   ├── voice.js
    │   ├── sound.js
    │   ├── react-native-fs.js
    │   ├── geolocation.js
    │   ├── react-native-maps.js
    │   └── react-native-sqlite-storage.js
    └── __tests__/                    # Unit test suites
        ├── VoiceRecorderService.test.js
        ├── SpeechRecognitionService.test.js
        ├── audioHelpers.test.js
        ├── GpsTrackingService.test.js
        ├── OfflineTileService.test.js
        └── tashkentConstants.test.js
```

---

## Getting started

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18 LTS |
| npm | 9 |
| React Native CLI | 0.73 |
| Android Studio / Xcode | latest stable |

### Install dependencies

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

Test Suites: 3 passed, 3 total
Tests:       58 passed, 58 total
```

### Run a single test file

```bash
npx jest src/__tests__/VoiceRecorderService.test.js
npx jest src/__tests__/SpeechRecognitionService.test.js
npx jest src/__tests__/audioHelpers.test.js
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
