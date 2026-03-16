/**
 * useGpsTracking
 *
 * React hook that wraps GpsTrackingService and exposes reactive state
 * to function components.
 *
 * Usage:
 *   const {currentPosition, track, isTracking, startTracking, stopTracking} =
 *     useGpsTracking();
 */

import {useState, useEffect, useCallback} from 'react';
import GpsTrackingService from '../services/GpsTrackingService';

/**
 * @returns {{
 *   currentPosition: import('../services/GpsTrackingService').TrackPoint|null,
 *   track: import('../services/GpsTrackingService').TrackPoint[],
 *   isTracking: boolean,
 *   error: Error|null,
 *   startTracking: Function,
 *   stopTracking: Function,
 *   clearTrack: Function,
 * }}
 */
function useGpsTracking() {
  const [currentPosition, setCurrentPosition] = useState(
    GpsTrackingService.getCurrentPosition(),
  );
  const [track, setTrack] = useState(GpsTrackingService.getTrack());
  const [isTracking, setIsTracking] = useState(GpsTrackingService.isTracking);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubLocation = GpsTrackingService.onLocationUpdate(point => {
      setCurrentPosition(point);
      setTrack(GpsTrackingService.getTrack());
    });

    const unsubError = GpsTrackingService.onError(err => {
      setError(err);
    });

    // Sync initial state in case tracking was already active
    setIsTracking(GpsTrackingService.isTracking);
    setCurrentPosition(GpsTrackingService.getCurrentPosition());
    setTrack(GpsTrackingService.getTrack());

    return () => {
      unsubLocation();
      unsubError();
    };
  }, []);

  const startTracking = useCallback(() => {
    setError(null);
    GpsTrackingService.startTracking();
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    GpsTrackingService.stopTracking();
    setIsTracking(false);
  }, []);

  const clearTrack = useCallback(() => {
    GpsTrackingService.clearTrack();
    setTrack([]);
  }, []);

  return {
    currentPosition,
    track,
    isTracking,
    error,
    startTracking,
    stopTracking,
    clearTrack,
  };
}

export default useGpsTracking;
