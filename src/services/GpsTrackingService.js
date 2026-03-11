/**
 * GpsTrackingService
 *
 * Provides continuous GPS tracking that works entirely offline.
 * Uses @react-native-community/geolocation which reads the device's
 * hardware GPS chipset without requiring network connectivity.
 *
 * Features:
 *  - Start / stop continuous location watching
 *  - Persist the track as a sequence of timestamped coordinates
 *  - Emit events via a simple subscription model
 *  - Accuracy filtering to discard low-quality fixes
 */

import Geolocation from '@react-native-community/geolocation';

/** Minimum accuracy (metres) a fix must have to be accepted */
const ACCURACY_THRESHOLD_METRES = 50;

/** Desired distance filter – only emit updates when device moves this far */
const DISTANCE_FILTER_METRES = 5;

/**
 * @typedef {Object} TrackPoint
 * @property {number} latitude
 * @property {number} longitude
 * @property {number|null} altitude       - Metres above sea level (or null)
 * @property {number|null} accuracy       - Horizontal accuracy in metres (or null)
 * @property {number|null} speed          - Speed in m/s (or null)
 * @property {number|null} heading        - Bearing in degrees (or null)
 * @property {number} timestamp           - Unix timestamp in milliseconds
 */

class GpsTrackingService {
  constructor() {
    /** @type {number|null} Geolocation watch ID */
    this._watchId = null;

    /** @type {TrackPoint[]} Accumulated track points for this session */
    this._track = [];

    /** @type {TrackPoint|null} Most recent GPS fix */
    this._currentPosition = null;

    /** @type {Set<Function>} Location update subscribers */
    this._subscribers = new Set();

    /** @type {Set<Function>} Error subscribers */
    this._errorSubscribers = new Set();

    this._isTracking = false;
  }

  /**
   * Returns true while the service is actively watching the GPS.
   * @returns {boolean}
   */
  get isTracking() {
    return this._isTracking;
  }

  /**
   * Returns a shallow copy of the current track.
   * @returns {TrackPoint[]}
   */
  getTrack() {
    return [...this._track];
  }

  /**
   * Returns the most recent GPS fix, or null before the first fix.
   * @returns {TrackPoint|null}
   */
  getCurrentPosition() {
    return this._currentPosition;
  }

  /**
   * Subscribes to location updates.
   * @param {Function} callback - Called with (TrackPoint) on every accepted fix
   * @returns {Function} Unsubscribe function
   */
  onLocationUpdate(callback) {
    this._subscribers.add(callback);
    return () => this._subscribers.delete(callback);
  }

  /**
   * Subscribes to GPS errors.
   * @param {Function} callback - Called with (Error) on GPS failure
   * @returns {Function} Unsubscribe function
   */
  onError(callback) {
    this._errorSubscribers.add(callback);
    return () => this._errorSubscribers.delete(callback);
  }

  /**
   * Starts continuous GPS tracking.
   * Safe to call multiple times – a second call is a no-op.
   */
  startTracking() {
    if (this._isTracking) {
      return;
    }

    this._isTracking = true;

    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
    });

    this._watchId = Geolocation.watchPosition(
      position => this._handlePosition(position),
      error => this._handleError(error),
      {
        enableHighAccuracy: true,
        distanceFilter: DISTANCE_FILTER_METRES,
        interval: 2000,
        fastestInterval: 1000,
        forceRequestLocation: true,
        useSignificantChanges: false,
      },
    );
  }

  /**
   * Stops GPS tracking and releases the watch.
   */
  stopTracking() {
    if (!this._isTracking) {
      return;
    }

    if (this._watchId !== null) {
      Geolocation.clearWatch(this._watchId);
      this._watchId = null;
    }

    this._isTracking = false;
  }

  /**
   * Clears the accumulated track but keeps tracking active.
   */
  clearTrack() {
    this._track = [];
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Processes a raw Geolocation position object.
   * Discards fixes that exceed the accuracy threshold.
   * @param {Object} position
   */
  _handlePosition(position) {
    const {coords, timestamp} = position;

    // Filter out inaccurate fixes
    if (
      coords.accuracy !== null &&
      coords.accuracy > ACCURACY_THRESHOLD_METRES
    ) {
      return;
    }

    /** @type {TrackPoint} */
    const point = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      altitude: coords.altitude ?? null,
      accuracy: coords.accuracy ?? null,
      speed: coords.speed ?? null,
      heading: coords.heading ?? null,
      timestamp,
    };

    this._currentPosition = point;
    this._track.push(point);

    this._subscribers.forEach(cb => cb(point));
  }

  /**
   * Handles Geolocation errors.
   * @param {Object} error
   */
  _handleError(error) {
    const err = new Error(error.message || 'GPS error');
    err.code = error.code;
    this._errorSubscribers.forEach(cb => cb(err));
  }
}

// Export a singleton so all components share the same tracking session
export default new GpsTrackingService();
