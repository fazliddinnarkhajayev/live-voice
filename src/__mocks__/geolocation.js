/**
 * Mock for @react-native-community/geolocation
 */

const callbacks = {
  success: null,
  error: null,
};

let watchIdCounter = 0;

const Geolocation = {
  setRNConfiguration: jest.fn(),

  getCurrentPosition: jest.fn((success, error) => {
    callbacks.success = success;
    callbacks.error = error;
  }),

  watchPosition: jest.fn((success, error) => {
    callbacks.success = success;
    callbacks.error = error;
    watchIdCounter++;
    return watchIdCounter;
  }),

  clearWatch: jest.fn(),

  stopObserving: jest.fn(),

  // Test helpers
  _simulatePosition: position => {
    if (callbacks.success) {
      callbacks.success(position);
    }
  },

  _simulateError: error => {
    if (callbacks.error) {
      callbacks.error(error);
    }
  },

  _reset: () => {
    callbacks.success = null;
    callbacks.error = null;
    watchIdCounter = 0;
    Geolocation.setRNConfiguration.mockClear();
    Geolocation.getCurrentPosition.mockClear();
    Geolocation.watchPosition.mockClear();
    Geolocation.clearWatch.mockClear();
  },
};

module.exports = Geolocation;
module.exports.default = Geolocation;
