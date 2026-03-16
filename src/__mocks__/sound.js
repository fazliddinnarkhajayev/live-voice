/**
 * Mock for react-native-sound
 */

const Sound = jest.fn().mockImplementation((_file, _base, callback) => {
  if (callback) callback(null);
  return {
    play: jest.fn(cb => cb && cb(true)),
    pause: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
    getDuration: jest.fn(() => 60),
  };
});

Sound.MAIN_BUNDLE = 'MAIN_BUNDLE';
Sound.DOCUMENT = 'DOCUMENT';
Sound.LIBRARY = 'LIBRARY';
Sound.CACHES = 'CACHES';

module.exports = Sound;
