/**
 * Tashkent geographic constants.
 *
 * Bounding box, centre coordinate, and default zoom levels for
 * Tashkent, Uzbekistan – used by every map-related component in this module.
 */

/** WGS-84 centre of Tashkent city */
export const TASHKENT_CENTER = {
  latitude: 41.2995,
  longitude: 69.2401,
};

/**
 * Tight bounding box around the city of Tashkent.
 * Offline tile sets and GPS boundary checks use these values.
 */
export const TASHKENT_BOUNDS = {
  north: 41.4,
  south: 41.2,
  east: 69.45,
  west: 69.1,
};

/** Default delta values for MapView's region prop (≈ city-level zoom) */
export const DEFAULT_DELTA = {
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

/** Zoom level constants for convenience */
export const ZOOM_LEVELS = {
  CITY: 12,
  DISTRICT: 14,
  STREET: 16,
  BUILDING: 18,
};

/** Tile zoom range stored in the offline MBTiles database */
export const OFFLINE_TILE_ZOOM_RANGE = {
  min: 10,
  max: 17,
};
