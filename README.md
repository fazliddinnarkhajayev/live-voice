# Live Voice

A React Native voice recording and speech-recognition module.

---

## Features

- **Voice recording** – start and stop audio recording sessions, list and delete saved recordings.
- **Speech-to-text** – real-time transcription via `@react-native-community/voice`.
- **Audio utilities** – duration formatting, filename generation, transcript validation.

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
    │   └── SpeechRecognitionService.js # Speech-to-text wrapper
    ├── utils/
    │   └── audioHelpers.js           # Pure helper functions
    ├── __mocks__/                    # Jest mocks for native modules
    │   ├── voice.js
    │   ├── sound.js
    │   └── react-native-fs.js
    └── __tests__/                    # Unit test suites
        ├── VoiceRecorderService.test.js
        ├── SpeechRecognitionService.test.js
        └── audioHelpers.test.js
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