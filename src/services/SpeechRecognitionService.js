/**
 * SpeechRecognitionService
 *
 * Wraps the @react-native-community/voice module and exposes a simple
 * promise-based API for starting and stopping speech-to-text recognition.
 */

class SpeechRecognitionService {
  constructor(Voice) {
    this._Voice = Voice;
    this._isListening = false;
    this._lastTranscript = '';
    this._subscribers = [];

    this._Voice.onSpeechResults = this._handleResults.bind(this);
    this._Voice.onSpeechError = this._handleError.bind(this);
  }

  isListening() {
    return this._isListening;
  }

  lastTranscript() {
    return this._lastTranscript;
  }

  subscribe(callback) {
    this._subscribers.push(callback);
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback);
    };
  }

  async startListening(locale = 'en-US') {
    if (this._isListening) {
      throw new Error('Speech recognition is already active');
    }
    await this._Voice.start(locale);
    this._isListening = true;
  }

  async stopListening() {
    if (!this._isListening) {
      throw new Error('Speech recognition is not active');
    }
    await this._Voice.stop();
    this._isListening = false;
  }

  async destroy() {
    await this._Voice.destroy();
    this._isListening = false;
    this._subscribers = [];
  }

  _handleResults(event) {
    if (event && event.value && event.value.length > 0) {
      this._lastTranscript = event.value[0];
      this._subscribers.forEach(cb => cb(this._lastTranscript));
    }
  }

  _handleError(error) {
    this._isListening = false;
    this._subscribers.forEach(cb => cb(null, error));
  }
}

module.exports = SpeechRecognitionService;
