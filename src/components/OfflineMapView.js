/**
 * OfflineMapView
 *
 * Renders an offline map centred on Tashkent using locally stored tiles.
 * Tiles are served from the device's document directory via
 * OfflineTileService.  When no tiles are available the component shows an
 * informative placeholder instead of a broken map.
 *
 * Props:
 *  - userLocation  {TrackPoint|null}  Current GPS fix (renders blue dot + accuracy circle)
 *  - track         {TrackPoint[]}     List of track points (rendered as a polyline)
 *  - style         {Object}           Additional styles forwarded to the container
 *  - onMapReady    {Function}         Called once the map has finished loading
 */

import React, {useEffect, useState, useRef} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import MapView, {UrlTile, Polyline, Circle, Marker} from 'react-native-maps';
import {
  getOfflineTileUrlTemplate,
  initOfflineTiles,
} from '../services/OfflineTileService';
import {
  TASHKENT_CENTER,
  DEFAULT_DELTA,
  OFFLINE_TILE_ZOOM_RANGE,
} from '../utils/tashkentConstants';

/** Colour palette */
const COLORS = {
  track: '#1E88E5',
  trackBorder: '#0D47A1',
  accuracyFill: 'rgba(30, 136, 229, 0.15)',
  accuracyStroke: 'rgba(30, 136, 229, 0.4)',
  userDot: '#1E88E5',
  userDotBorder: '#FFFFFF',
};

function OfflineMapView({userLocation, track = [], style, onMapReady}) {
  const mapRef = useRef(null);
  const [tilesReady, setTilesReady] = useState(false);
  const [tileUrl, setTileUrl] = useState(null);
  const [initError, setInitError] = useState(null);

  // Initialise tile assets on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await initOfflineTiles();
        if (!cancelled) {
          setTileUrl(getOfflineTileUrlTemplate());
          setTilesReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setInitError(err.message);
          // Fall back to online tiles so the map is still usable when connected
          setTileUrl(
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          );
          setTilesReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Animate camera to the user's current position whenever it changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: DEFAULT_DELTA.latitudeDelta / 4,
          longitudeDelta: DEFAULT_DELTA.longitudeDelta / 4,
        },
        600,
      );
    }
  }, [userLocation]);

  const polylineCoords = track.map(p => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  if (!tilesReady) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={COLORS.userDot} />
        <Text style={styles.loadingText}>Loading offline map…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {initError && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠ Offline tiles not found – using online map
          </Text>
        </View>
      )}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...TASHKENT_CENTER,
          ...DEFAULT_DELTA,
        }}
        mapType="none"
        showsUserLocation={false}
        showsMyLocationButton={false}
        rotateEnabled={false}
        onMapReady={onMapReady}>
        {/* Offline tile layer */}
        {tileUrl && (
          <UrlTile
            urlTemplate={tileUrl}
            maximumZ={OFFLINE_TILE_ZOOM_RANGE.max}
            minimumZ={OFFLINE_TILE_ZOOM_RANGE.min}
            flipY={false}
            tileSize={256}
            offlineMode={true}
          />
        )}

        {/* User track polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor={COLORS.track}
            strokeWidth={3}
          />
        )}

        {/* GPS accuracy circle */}
        {userLocation && userLocation.accuracy && (
          <Circle
            center={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            radius={userLocation.accuracy}
            fillColor={COLORS.accuracyFill}
            strokeColor={COLORS.accuracyStroke}
            strokeWidth={1}
          />
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            anchor={{x: 0.5, y: 0.5}}
            flat>
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EAF6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#455A64',
  },
  warningBanner: {
    backgroundColor: '#FFF9C4',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  warningText: {
    fontSize: 12,
    color: '#F57F17',
    textAlign: 'center',
  },
  userMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.userDotBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 5,
  },
  userMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.userDot,
  },
});

export default OfflineMapView;
