/**
 * OfflineMapScreen
 *
 * Top-level screen that combines OfflineMapView with GPS tracking controls.
 * Handles Android runtime permission requests for ACCESS_FINE_LOCATION.
 */

import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import OfflineMapView from '../components/OfflineMapView';
import TrackingControls from '../components/TrackingControls';
import useGpsTracking from '../hooks/useGpsTracking';

/** Request Android fine-location permission; iOS permissions are handled in Info.plist */
async function requestLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'Live Voice needs access to your GPS so the offline map can show your position.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

function OfflineMapScreen() {
  const {
    currentPosition,
    track,
    isTracking,
    error,
    startTracking,
    stopTracking,
    clearTrack,
  } = useGpsTracking();

  const [permissionGranted, setPermissionGranted] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    requestLocationPermission().then(granted => {
      setPermissionGranted(granted);
    });
  }, []);

  const handleStart = useCallback(() => {
    if (permissionGranted) {
      startTracking();
    }
  }, [permissionGranted, startTracking]);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  // Permission denied state
  if (permissionGranted === false) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionIcon}>📍</Text>
        <Text style={styles.permissionTitle}>Location Access Required</Text>
        <Text style={styles.permissionMessage}>
          The offline map needs access to your GPS to show your position on the
          Tashkent map and to record your route.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() =>
            requestLocationPermission().then(setPermissionGranted)
          }>
          <Text style={styles.permissionButtonText}>Request Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>🗺 Tashkent Map</Text>
        <Text style={styles.headerSubtitle}>Offline · GPS Tracking</Text>
      </SafeAreaView>

      {/* Map fills remaining space */}
      <View style={styles.mapContainer}>
        <OfflineMapView
          userLocation={currentPosition}
          track={track}
          style={styles.map}
          onMapReady={handleMapReady}
        />

        {/* Map-ready indicator (fade out after map loads) */}
        {!mapReady && (
          <View style={styles.mapOverlay}>
            <Text style={styles.mapOverlayText}>Initialising map…</Text>
          </View>
        )}
      </View>

      {/* Bottom controls panel */}
      <TrackingControls
        isTracking={isTracking}
        currentPosition={currentPosition}
        trackLength={track.length}
        error={error}
        onStart={handleStart}
        onStop={stopTracking}
        onClear={clearTrack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8EAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlayText: {
    fontSize: 16,
    color: '#455A64',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FAFAFA',
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  permissionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default OfflineMapScreen;
