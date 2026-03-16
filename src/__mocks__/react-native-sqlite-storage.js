/**
 * Mock for react-native-sqlite-storage
 */

const SQLite = {
  openDatabase: jest.fn().mockReturnValue({
    transaction: jest.fn((cb, errCb, successCb) => {
      if (successCb) successCb();
    }),
    executeSql: jest.fn().mockResolvedValue([{rows: {length: 0, item: jest.fn()}}]),
    close: jest.fn(),
  }),

  enablePromise: jest.fn(),

  DEBUG: jest.fn(),
};

module.exports = SQLite;
module.exports.default = SQLite;
