/**
 * TrackingControls
 *
 * Bottom-sheet style control panel rendered above the map.
 * Shows current GPS fix details and start/stop tracking buttons.
 *
 * Props:
 *  - isTracking      {boolean}
 *  - currentPosition {TrackPoint|null}
 *  - trackLength     {number}          Number of recorded track points
 *  - error           {Error|null}
 *  - onStart         {Function}
 *  - onStop          {Function}
 *  - onClear         {Function}
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

function TrackingControls({
  isTracking,
  currentPosition,
  trackLength,
  error,
  onStart,
  onStop,
  onClear,
}) {
  const formatCoord = num =>
    num !== null && num !== undefined ? num.toFixed(6) : '–';
  const formatMetres = num =>
    num !== null && num !== undefined ? `${Math.round(num)} m` : '–';
  const formatSpeed = num =>
    num !== null && num !== undefined
      ? `${(num * 3.6).toFixed(1)} km/h`
      : '–';

  return (
    <View style={styles.panel}>
      {/* GPS status row */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusDot,
            isTracking ? styles.statusActive : styles.statusIdle,
          ]}
        />
        <Text style={styles.statusLabel}>
          {isTracking ? 'Tracking GPS…' : 'GPS idle'}
        </Text>
        <Text style={styles.trackCount}>{trackLength} points</Text>
      </View>

      {/* Error message */}
      {error && (
        <Text style={styles.errorText}>⚠ {error.message}</Text>
      )}

      {/* Coordinate readout */}
      {currentPosition ? (
        <View style={styles.coordGrid}>
          <CoordItem
            label="Lat"
            value={formatCoord(currentPosition.latitude)}
          />
          <CoordItem
            label="Lon"
            value={formatCoord(currentPosition.longitude)}
          />
          <CoordItem
            label="Accuracy"
            value={formatMetres(currentPosition.accuracy)}
          />
          <CoordItem
            label="Speed"
            value={formatSpeed(currentPosition.speed)}
          />
          {currentPosition.altitude !== null && (
            <CoordItem
              label="Altitude"
              value={formatMetres(currentPosition.altitude)}
            />
          )}
        </View>
      ) : (
        <Text style={styles.noFixText}>Waiting for GPS fix…</Text>
      )}

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        {isTracking ? (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={onStop}
            accessibilityRole="button"
            accessibilityLabel="Stop GPS tracking">
            <Text style={styles.buttonText}>⏹ Stop</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={onStart}
            accessibilityRole="button"
            accessibilityLabel="Start GPS tracking">
            <Text style={styles.buttonText}>▶ Start</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            styles.clearButton,
            trackLength === 0 && styles.buttonDisabled,
          ]}
          onPress={onClear}
          disabled={trackLength === 0}
          accessibilityRole="button"
          accessibilityLabel="Clear GPS track">
          <Text style={[styles.buttonText, trackLength === 0 && styles.disabledText]}>
            🗑 Clear
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CoordItem({label, value}) {
  return (
    <View style={styles.coordItem}>
      <Text style={styles.coordLabel}>{label}</Text>
      <Text style={styles.coordValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowOffset: {width: 0, height: -3},
        shadowRadius: 6,
      },
      android: {elevation: 8},
    }),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusActive: {
    backgroundColor: '#43A047',
  },
  statusIdle: {
    backgroundColor: '#9E9E9E',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  trackCount: {
    fontSize: 12,
    color: '#757575',
  },
  errorText: {
    fontSize: 12,
    color: '#E53935',
    marginBottom: 6,
  },
  coordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  coordItem: {
    width: '33.33%',
    paddingVertical: 4,
  },
  coordLabel: {
    fontSize: 10,
    color: '#9E9E9E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordValue: {
    fontSize: 13,
    color: '#212121',
    fontVariant: ['tabular-nums'],
  },
  noFixText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 12,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#1E88E5',
  },
  stopButton: {
    backgroundColor: '#E53935',
  },
  clearButton: {
    backgroundColor: '#ECEFF1',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#9E9E9E',
  },
});

export default TrackingControls;
