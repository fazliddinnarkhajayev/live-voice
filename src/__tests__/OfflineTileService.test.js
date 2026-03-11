/**
 * Tests for OfflineTileService
 */

import {
  lonToTileX,
  latToTileY,
  getLocalTileUri,
  getOfflineTileUrlTemplate,
  verifyTileCoverage,
} from '../services/OfflineTileService';
import RNFS from 'react-native-fs';

const TILES_DIR = '/mock/documents/tiles';

beforeEach(() => {
  RNFS._reset();
});

describe('lonToTileX', () => {
  it('converts 0° longitude to the correct tile at zoom 1', () => {
    expect(lonToTileX(0, 1)).toBe(1);
  });

  it('converts -180° longitude to tile 0', () => {
    expect(lonToTileX(-180, 0)).toBe(0);
  });

  it('converts Tashkent longitude correctly at zoom 10', () => {
    // Tashkent lon ≈ 69.24 → tile x 708 at z=10
    const x = lonToTileX(69.2401, 10);
    expect(x).toBeGreaterThan(700);
    expect(x).toBeLessThan(720);
  });
});

describe('latToTileY', () => {
  it('converts Tashkent latitude to a reasonable tile Y at zoom 10', () => {
    // Tashkent lat ≈ 41.3 → tile y 382 at z=10
    const y = latToTileY(41.2995, 10);
    expect(y).toBeGreaterThan(375);
    expect(y).toBeLessThan(390);
  });

  it('returns a non-negative tile index', () => {
    expect(latToTileY(85, 1)).toBeGreaterThanOrEqual(0);
    expect(latToTileY(-85, 1)).toBeGreaterThanOrEqual(0);
  });
});

describe('getLocalTileUri', () => {
  it('returns null when the tile file does not exist', async () => {
    RNFS.exists.mockResolvedValue(false);
    const uri = await getLocalTileUri(12, 604, 371);
    expect(uri).toBeNull();
  });

  it('returns a file:// URI when the tile file exists', async () => {
    RNFS.exists.mockResolvedValue(true);
    const uri = await getLocalTileUri(12, 604, 371);
    expect(uri).toMatch(/^file:\/\//);
    expect(uri).toContain('/tiles/12/604/371.png');
  });

  it('returns null if RNFS.exists throws', async () => {
    RNFS.exists.mockRejectedValue(new Error('disk error'));
    const uri = await getLocalTileUri(12, 604, 371);
    expect(uri).toBeNull();
  });
});

describe('getOfflineTileUrlTemplate', () => {
  it('contains the required template variables', () => {
    const template = getOfflineTileUrlTemplate();
    expect(template).toContain('{z}');
    expect(template).toContain('{x}');
    expect(template).toContain('{y}');
  });

  it('starts with file://', () => {
    expect(getOfflineTileUrlTemplate()).toMatch(/^file:\/\//);
  });
});

describe('verifyTileCoverage', () => {
  it('reports complete=false when all tiles are missing', async () => {
    RNFS.exists.mockResolvedValue(false);
    const result = await verifyTileCoverage();
    expect(result.complete).toBe(false);
    expect(result.missingCount).toBeGreaterThan(0);
    expect(result.missingCount).toBe(result.totalCount);
  });

  it('reports complete=true when all tiles are present', async () => {
    RNFS.exists.mockResolvedValue(true);
    const result = await verifyTileCoverage();
    expect(result.complete).toBe(true);
    expect(result.missingCount).toBe(0);
  });

  it('missingCount plus present tiles equals totalCount', async () => {
    let call = 0;
    // Alternate: even calls return present, odd calls return missing
    RNFS.exists.mockImplementation(() => {
      call++;
      return Promise.resolve(call % 2 === 0);
    });
    const result = await verifyTileCoverage();
    const presentCount = result.totalCount - result.missingCount;
    // Both halves should be non-zero and sum to total
    expect(presentCount).toBeGreaterThan(0);
    expect(result.missingCount).toBeGreaterThan(0);
    expect(result.missingCount + presentCount).toBe(result.totalCount);
  });
});
