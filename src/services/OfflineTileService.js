/**
 * OfflineTileService
 *
 * Manages locally stored map tiles for Tashkent.
 * Tiles are stored as a flat file tree under the app's document directory:
 *
 *   <DocumentDir>/tiles/{z}/{x}/{y}.png
 *
 * The service exposes helpers to:
 *  - Check whether a tile exists locally
 *  - Build the local file URI for a tile (used by MapView's urlTemplate)
 *  - Verify tile coverage for a given region / zoom range
 *
 * Tile data is expected to be bundled with the app (copied from
 * android/app/src/main/assets/tiles into the document directory on first
 * launch) or downloaded in the background by a future sync job.
 */

import RNFS from 'react-native-fs';
import {OFFLINE_TILE_ZOOM_RANGE, TASHKENT_BOUNDS} from '../utils/tashkentConstants';

/** Root directory where offline tiles are stored */
export const TILES_DIR = `${RNFS.DocumentDirectoryPath}/tiles`;

/**
 * Converts a longitude to an OSM tile X index at the given zoom level.
 * @param {number} lon - Longitude in degrees
 * @param {number} zoom - Zoom level (integer)
 * @returns {number} Tile X index
 */
export function lonToTileX(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

/**
 * Converts a latitude to an OSM tile Y index at the given zoom level.
 * @param {number} lat - Latitude in degrees
 * @param {number} zoom - Zoom level (integer)
 * @returns {number} Tile Y index
 */
export function latToTileY(lat, zoom) {
  const latRad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom),
  );
}

/**
 * Returns the local file:// URI for a tile.
 * Returns null when the tile file does not exist on disk.
 *
 * @param {number} z - Zoom level
 * @param {number} x - Tile X
 * @param {number} y - Tile Y
 * @returns {Promise<string|null>}
 */
export async function getLocalTileUri(z, x, y) {
  const path = `${TILES_DIR}/${z}/${x}/${y}.png`;
  try {
    const exists = await RNFS.exists(path);
    return exists ? `file://${path}` : null;
  } catch {
    return null;
  }
}

/**
 * Verifies that all tiles within the Tashkent bounding box are present
 * for every zoom level in OFFLINE_TILE_ZOOM_RANGE.
 *
 * @returns {Promise<{complete: boolean, missingCount: number, totalCount: number}>}
 */
export async function verifyTileCoverage() {
  let totalCount = 0;
  let missingCount = 0;

  for (let z = OFFLINE_TILE_ZOOM_RANGE.min; z <= OFFLINE_TILE_ZOOM_RANGE.max; z++) {
    const xMin = lonToTileX(TASHKENT_BOUNDS.west, z);
    const xMax = lonToTileX(TASHKENT_BOUNDS.east, z);
    const yMin = latToTileY(TASHKENT_BOUNDS.north, z);
    const yMax = latToTileY(TASHKENT_BOUNDS.south, z);

    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        totalCount++;
        const uri = await getLocalTileUri(z, x, y);
        if (!uri) {
          missingCount++;
        }
      }
    }
  }

  return {
    complete: missingCount === 0,
    missingCount,
    totalCount,
  };
}

/**
 * Copies bundled tile assets from the Android assets folder into the
 * document directory on first launch so the offline map can serve them.
 *
 * On iOS, tiles are expected to be pre-packaged inside the app bundle and
 * accessed via a direct file:// URI.
 *
 * @param {Function} [onProgress] - Optional callback(copiedCount, totalCount)
 * @returns {Promise<void>}
 */
export async function initOfflineTiles(onProgress) {
  const targetDir = TILES_DIR;

  // Ensure the base tiles directory exists
  const dirExists = await RNFS.exists(targetDir);
  if (!dirExists) {
    await RNFS.mkdir(targetDir);
  }

  // On Android, copy from assets. On iOS the tiles live in the bundle.
  if (RNFS.ExternalDirectoryPath !== undefined) {
    // Android path
    try {
      const assetItems = await RNFS.readDirAssets('tiles');
      let copied = 0;
      const total = assetItems.length;

      for (const item of assetItems) {
        const relativePath = item.path.replace(/^tiles\//, '');
        const destPath = `${targetDir}/${relativePath}`;

        // Create sub-directories as needed
        const destDir = destPath.substring(0, destPath.lastIndexOf('/'));
        const destDirExists = await RNFS.exists(destDir);
        if (!destDirExists) {
          await RNFS.mkdir(destDir);
        }

        const destExists = await RNFS.exists(destPath);
        if (!destExists) {
          await RNFS.copyFileAssets(item.path, destPath);
        }

        copied++;
        if (onProgress) {
          onProgress(copied, total);
        }
      }
    } catch (err) {
      // Asset directory may not exist in dev builds; silently skip
      console.warn('[OfflineTileService] Could not copy bundled tiles:', err.message);
    }
  }
}

/**
 * Builds the URL template string used by react-native-maps UrlTile.
 * The template replaces {z}, {x}, {y} with actual tile coordinates.
 *
 * @returns {string} Local file:// URL template
 */
export function getOfflineTileUrlTemplate() {
  return `file://${TILES_DIR}/{z}/{x}/{y}.png`;
}
