/**
 * Mock for react-native-fs
 */

const RNFS = {
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
  TemporaryDirectoryPath: '/mock/tmp',
  ExternalDirectoryPath: '/mock/external',

  exists: jest.fn().mockResolvedValue(false),
  mkdir: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
  readDir: jest.fn().mockResolvedValue([]),
  readDirAssets: jest.fn().mockResolvedValue([]),
  readFile: jest.fn().mockResolvedValue(''),
  writeFile: jest.fn().mockResolvedValue(undefined),
  copyFile: jest.fn().mockResolvedValue(undefined),
  copyFileAssets: jest.fn().mockResolvedValue(undefined),
  moveFile: jest.fn().mockResolvedValue(undefined),
  stat: jest.fn().mockResolvedValue({size: 0, isFile: () => true}),

  _reset: () => {
    RNFS.exists.mockReset().mockResolvedValue(false);
    RNFS.mkdir.mockReset().mockResolvedValue(undefined);
    RNFS.readDir.mockReset().mockResolvedValue([]);
    RNFS.readDirAssets.mockReset().mockResolvedValue([]);
    RNFS.copyFileAssets.mockReset().mockResolvedValue(undefined);
  },
};

module.exports = RNFS;
