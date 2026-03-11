/**
 * Mock for react-native-fs
 */

const RNFS = {
  DocumentDirectoryPath: '/mock/documents',
  ExternalDirectoryPath: '/mock/external',

  exists: jest.fn().mockResolvedValue(false),
  mkdir: jest.fn().mockResolvedValue(undefined),
  readDir: jest.fn().mockResolvedValue([]),
  readDirAssets: jest.fn().mockResolvedValue([]),
  copyFileAssets: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(''),
  unlink: jest.fn().mockResolvedValue(undefined),

  _reset: () => {
    RNFS.exists.mockReset().mockResolvedValue(false);
    RNFS.mkdir.mockReset().mockResolvedValue(undefined);
    RNFS.readDir.mockReset().mockResolvedValue([]);
    RNFS.readDirAssets.mockReset().mockResolvedValue([]);
    RNFS.copyFileAssets.mockReset().mockResolvedValue(undefined);
  },
};

module.exports = RNFS;
module.exports.default = RNFS;
