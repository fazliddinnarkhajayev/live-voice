# Live Voice – Offline Map of Tashkent

A React Native module that provides a **fully offline map of Tashkent, Uzbekistan** with **real-time GPS tracking**, designed as a companion module for the *Live Voice* accessibility app.

## Features

- 🗺 **Offline map** – OpenStreetMap tiles for Tashkent (zoom 10–17) served from local storage – no internet required
- 📍 **GPS tracking** – Continuous position tracking using the device's hardware GPS chipset
- 🛤 **Track recording** – Records the full route as a polyline drawn on the map
- 🎯 **Accuracy ring** – Visualises GPS horizontal accuracy around the user's position
- 🔋 **Battery-aware** – 5 m distance filter minimises unnecessary wake-ups
- ✈️ **Airplane mode** – Works entirely without network connectivity

## Module Structure

```
live-voice-offline-map/
├── index.js                          # App entry point / navigation root
├── src/
│   ├── screens/OfflineMapScreen.js   # Top-level screen
│   ├── components/
│   │   ├── OfflineMapView.js         # MapView with offline UrlTile layer
│   │   └── TrackingControls.js       # Start/Stop/Clear panel
│   ├── services/
│   │   ├── GpsTrackingService.js     # Singleton GPS watcher
│   │   └── OfflineTileService.js     # Tile file management helpers
│   ├── hooks/useGpsTracking.js       # React hook wrapping GpsTrackingService
│   ├── utils/tashkentConstants.js    # Geographic constants for Tashkent
│   └── __tests__/                    # Jest unit tests
├── android/app/src/main/
│   ├── AndroidManifest.xml           # Location permissions
│   └── assets/tiles/                 # Bundled offline tile assets
└── ios/Info.plist                    # Location permission descriptions
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Provide offline tiles

Tiles must be placed under `android/app/src/main/assets/tiles/` before building.
See `android/app/src/main/assets/tiles/README.md` for generation instructions.

Tile structure follows the standard OSM `{z}/{x}/{y}.png` convention:

```
tiles/10/708/382.png  ...  tiles/17/…
```

### 3. Run

```bash
npm run android   # Android
npm run ios       # iOS (requires pod install first)
```

## GPS Tracking

GPS tracking works **entirely offline** using the device's hardware GPS chipset.
Fixes with horizontal accuracy worse than **50 m** are automatically discarded.

### Required Permissions

| Platform | Permission |
|---|---|
| Android | `ACCESS_FINE_LOCATION`, `ACCESS_BACKGROUND_LOCATION` |
| iOS | `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription` |

## Running Tests

```bash
npm test
```

All 42 tests run offline with mocked native modules.

## Offline Tile Coverage (Tashkent)

| Bound | Value |
|---|---|
| West  | 69.1° E |
| South | 41.2° N |
| East  | 69.45° E |
| North | 41.4° N |
| Zoom  | 10 – 17 |
