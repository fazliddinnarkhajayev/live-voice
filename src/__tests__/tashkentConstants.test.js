/**
 * Tests for tashkentConstants utility module
 */

import {
  TASHKENT_CENTER,
  TASHKENT_BOUNDS,
  DEFAULT_DELTA,
  ZOOM_LEVELS,
  OFFLINE_TILE_ZOOM_RANGE,
} from '../utils/tashkentConstants';

describe('tashkentConstants', () => {
  describe('TASHKENT_CENTER', () => {
    it('has a valid latitude within Tashkent city boundaries', () => {
      expect(TASHKENT_CENTER.latitude).toBeGreaterThanOrEqual(41.2);
      expect(TASHKENT_CENTER.latitude).toBeLessThanOrEqual(41.4);
    });

    it('has a valid longitude within Tashkent city boundaries', () => {
      expect(TASHKENT_CENTER.longitude).toBeGreaterThanOrEqual(69.1);
      expect(TASHKENT_CENTER.longitude).toBeLessThanOrEqual(69.45);
    });
  });

  describe('TASHKENT_BOUNDS', () => {
    it('north is greater than south', () => {
      expect(TASHKENT_BOUNDS.north).toBeGreaterThan(TASHKENT_BOUNDS.south);
    });

    it('east is greater than west', () => {
      expect(TASHKENT_BOUNDS.east).toBeGreaterThan(TASHKENT_BOUNDS.west);
    });

    it('contains TASHKENT_CENTER latitude', () => {
      expect(TASHKENT_CENTER.latitude).toBeGreaterThan(TASHKENT_BOUNDS.south);
      expect(TASHKENT_CENTER.latitude).toBeLessThan(TASHKENT_BOUNDS.north);
    });

    it('contains TASHKENT_CENTER longitude', () => {
      expect(TASHKENT_CENTER.longitude).toBeGreaterThan(TASHKENT_BOUNDS.west);
      expect(TASHKENT_CENTER.longitude).toBeLessThan(TASHKENT_BOUNDS.east);
    });
  });

  describe('DEFAULT_DELTA', () => {
    it('has positive latitudeDelta', () => {
      expect(DEFAULT_DELTA.latitudeDelta).toBeGreaterThan(0);
    });

    it('has positive longitudeDelta', () => {
      expect(DEFAULT_DELTA.longitudeDelta).toBeGreaterThan(0);
    });
  });

  describe('ZOOM_LEVELS', () => {
    it('zoom levels are in ascending order', () => {
      expect(ZOOM_LEVELS.CITY).toBeLessThan(ZOOM_LEVELS.DISTRICT);
      expect(ZOOM_LEVELS.DISTRICT).toBeLessThan(ZOOM_LEVELS.STREET);
      expect(ZOOM_LEVELS.STREET).toBeLessThan(ZOOM_LEVELS.BUILDING);
    });
  });

  describe('OFFLINE_TILE_ZOOM_RANGE', () => {
    it('min is less than max', () => {
      expect(OFFLINE_TILE_ZOOM_RANGE.min).toBeLessThan(
        OFFLINE_TILE_ZOOM_RANGE.max,
      );
    });

    it('min is at least zoom level 10', () => {
      expect(OFFLINE_TILE_ZOOM_RANGE.min).toBeGreaterThanOrEqual(10);
    });

    it('max does not exceed 20', () => {
      expect(OFFLINE_TILE_ZOOM_RANGE.max).toBeLessThanOrEqual(20);
    });
  });
});
