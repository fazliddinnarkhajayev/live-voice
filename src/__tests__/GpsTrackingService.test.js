/**
 * Tests for GpsTrackingService
 */

// We need a fresh instance of the service for each test
// so we isolate the module between tests
let GpsTrackingService;
let Geolocation;

beforeEach(() => {
  jest.isolateModules(() => {
    Geolocation = require('@react-native-community/geolocation');
    Geolocation._reset();
    GpsTrackingService = require('../services/GpsTrackingService').default;
  });
});

describe('GpsTrackingService – initial state', () => {
  it('isTracking is false initially', () => {
    expect(GpsTrackingService.isTracking).toBe(false);
  });

  it('track is empty initially', () => {
    expect(GpsTrackingService.getTrack()).toHaveLength(0);
  });

  it('currentPosition is null initially', () => {
    expect(GpsTrackingService.getCurrentPosition()).toBeNull();
  });
});

describe('GpsTrackingService – startTracking', () => {
  it('sets isTracking to true', () => {
    GpsTrackingService.startTracking();
    expect(GpsTrackingService.isTracking).toBe(true);
  });

  it('calls Geolocation.watchPosition', () => {
    GpsTrackingService.startTracking();
    expect(Geolocation.watchPosition).toHaveBeenCalledTimes(1);
  });

  it('does not call watchPosition again on a second startTracking call', () => {
    GpsTrackingService.startTracking();
    GpsTrackingService.startTracking();
    expect(Geolocation.watchPosition).toHaveBeenCalledTimes(1);
  });
});

describe('GpsTrackingService – stopTracking', () => {
  it('sets isTracking to false', () => {
    GpsTrackingService.startTracking();
    GpsTrackingService.stopTracking();
    expect(GpsTrackingService.isTracking).toBe(false);
  });

  it('calls Geolocation.clearWatch', () => {
    GpsTrackingService.startTracking();
    GpsTrackingService.stopTracking();
    expect(Geolocation.clearWatch).toHaveBeenCalledTimes(1);
  });

  it('is idempotent – calling stop without start does not throw', () => {
    expect(() => GpsTrackingService.stopTracking()).not.toThrow();
  });
});

describe('GpsTrackingService – position updates', () => {
  const mockPosition = {
    coords: {
      latitude: 41.2995,
      longitude: 69.2401,
      altitude: 480,
      accuracy: 10,
      speed: 1.5,
      heading: 90,
    },
    timestamp: 1700000000000,
  };

  it('stores received position in the track', () => {
    GpsTrackingService.startTracking();
    Geolocation._simulatePosition(mockPosition);
    expect(GpsTrackingService.getTrack()).toHaveLength(1);
  });

  it('updates currentPosition', () => {
    GpsTrackingService.startTracking();
    Geolocation._simulatePosition(mockPosition);
    const pos = GpsTrackingService.getCurrentPosition();
    expect(pos.latitude).toBe(41.2995);
    expect(pos.longitude).toBe(69.2401);
    expect(pos.accuracy).toBe(10);
  });

  it('notifies subscribers', () => {
    const handler = jest.fn();
    GpsTrackingService.onLocationUpdate(handler);
    GpsTrackingService.startTracking();
    Geolocation._simulatePosition(mockPosition);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({latitude: 41.2995}),
    );
  });

  it('discards fixes with accuracy worse than threshold', () => {
    const inaccuratePosition = {
      ...mockPosition,
      coords: {...mockPosition.coords, accuracy: 200},
    };
    GpsTrackingService.startTracking();
    Geolocation._simulatePosition(inaccuratePosition);
    expect(GpsTrackingService.getTrack()).toHaveLength(0);
  });

  it('unsubscribe prevents further notifications', () => {
    const handler = jest.fn();
    const unsub = GpsTrackingService.onLocationUpdate(handler);
    GpsTrackingService.startTracking();
    unsub();
    Geolocation._simulatePosition(mockPosition);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('GpsTrackingService – error handling', () => {
  it('notifies error subscribers on GPS failure', () => {
    const errorHandler = jest.fn();
    GpsTrackingService.onError(errorHandler);
    GpsTrackingService.startTracking();
    Geolocation._simulateError({code: 1, message: 'Permission denied'});
    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(errorHandler.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(errorHandler.mock.calls[0][0].message).toBe('Permission denied');
  });
});

describe('GpsTrackingService – clearTrack', () => {
  const mockPosition = {
    coords: {
      latitude: 41.2995,
      longitude: 69.2401,
      altitude: 480,
      accuracy: 10,
      speed: 0,
      heading: 0,
    },
    timestamp: 1700000000000,
  };

  it('resets the track array to empty', () => {
    GpsTrackingService.startTracking();
    Geolocation._simulatePosition(mockPosition);
    Geolocation._simulatePosition(mockPosition);
    expect(GpsTrackingService.getTrack()).toHaveLength(2);
    GpsTrackingService.clearTrack();
    expect(GpsTrackingService.getTrack()).toHaveLength(0);
  });

  it('does not stop tracking', () => {
    GpsTrackingService.startTracking();
    GpsTrackingService.clearTrack();
    expect(GpsTrackingService.isTracking).toBe(true);
  });
});
