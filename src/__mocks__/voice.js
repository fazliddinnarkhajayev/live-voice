/**
 * Mock for @react-native-community/voice
 *
 * Provides the same API surface as the real module and exposes
 * helper methods (_simulateSpeechResults, _simulateSpeechError)
 * so tests can trigger callbacks programmatically.
 */

const Voice = {
  onSpeechResults: null,
  onSpeechError: null,

  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn().mockResolvedValue(undefined),
  destroy: jest.fn().mockResolvedValue(undefined),

  /** Helper – trigger speech results from tests */
  _simulateSpeechResults(results) {
    if (typeof this.onSpeechResults === 'function') {
      this.onSpeechResults({ value: results });
    }
  },

  /** Helper – trigger a speech error from tests */
  _simulateSpeechError(error) {
    if (typeof this.onSpeechError === 'function') {
      this.onSpeechError(error);
    }
  },
};

module.exports = Voice;
