'use strict';

const SpeechRecognitionService = require('../services/SpeechRecognitionService');

/**
 * Build a fresh Voice mock for each test to avoid cross-test state leakage.
 */
function buildVoiceMock() {
  return {
    onSpeechResults: null,
    onSpeechError: null,
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    _simulateSpeechResults(results) {
      if (typeof this.onSpeechResults === 'function') {
        this.onSpeechResults({ value: results });
      }
    },
    _simulateSpeechError(error) {
      if (typeof this.onSpeechError === 'function') {
        this.onSpeechError(error);
      }
    },
  };
}

describe('SpeechRecognitionService', () => {
  describe('initial state', () => {
    it('is not listening when first created', () => {
      const service = new SpeechRecognitionService(buildVoiceMock());
      expect(service.isListening()).toBe(false);
    });

    it('has an empty last transcript when first created', () => {
      const service = new SpeechRecognitionService(buildVoiceMock());
      expect(service.lastTranscript()).toBe('');
    });
  });

  describe('startListening', () => {
    it('sets isListening to true', async () => {
      const service = new SpeechRecognitionService(buildVoiceMock());
      await service.startListening();
      expect(service.isListening()).toBe(true);
    });

    it('calls Voice.start with the given locale', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      await service.startListening('uz-UZ');
      expect(voice.start).toHaveBeenCalledWith('uz-UZ');
    });

    it('uses en-US as the default locale', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      await service.startListening();
      expect(voice.start).toHaveBeenCalledWith('en-US');
    });

    it('throws when already listening', async () => {
      const service = new SpeechRecognitionService(buildVoiceMock());
      await service.startListening();
      await expect(service.startListening()).rejects.toThrow(
        'Speech recognition is already active',
      );
    });
  });

  describe('stopListening', () => {
    it('sets isListening to false', async () => {
      const service = new SpeechRecognitionService(buildVoiceMock());
      await service.startListening();
      await service.stopListening();
      expect(service.isListening()).toBe(false);
    });

    it('calls Voice.stop', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      await service.startListening();
      await service.stopListening();
      expect(voice.stop).toHaveBeenCalled();
    });

    it('throws when not listening', async () => {
      const service = new SpeechRecognitionService(buildVoiceMock());
      await expect(service.stopListening()).rejects.toThrow(
        'Speech recognition is not active',
      );
    });
  });

  describe('speech results', () => {
    it('updates lastTranscript when results arrive', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      await service.startListening();
      voice._simulateSpeechResults(['hello world']);
      expect(service.lastTranscript()).toBe('hello world');
    });

    it('notifies subscribers with the transcript', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      const callback = jest.fn();
      service.subscribe(callback);
      await service.startListening();
      voice._simulateSpeechResults(['test phrase']);
      expect(callback).toHaveBeenCalledWith('test phrase');
    });

    it('uses the first result when multiple alternatives are provided', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      await service.startListening();
      voice._simulateSpeechResults(['first', 'second', 'third']);
      expect(service.lastTranscript()).toBe('first');
    });

    it('does not update transcript when results array is empty', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      await service.startListening();
      voice._simulateSpeechResults([]);
      expect(service.lastTranscript()).toBe('');
    });
  });

  describe('speech errors', () => {
    it('sets isListening to false on error', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      await service.startListening();
      voice._simulateSpeechError({ code: '7', message: 'No match' });
      expect(service.isListening()).toBe(false);
    });

    it('notifies subscribers with null transcript and the error', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      const callback = jest.fn();
      service.subscribe(callback);
      await service.startListening();
      const error = { code: '7', message: 'No match' };
      voice._simulateSpeechError(error);
      expect(callback).toHaveBeenCalledWith(null, error);
    });
  });

  describe('subscribe / unsubscribe', () => {
    it('stops receiving updates after unsubscribing', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      const callback = jest.fn();
      const unsubscribe = service.subscribe(callback);
      unsubscribe();
      await service.startListening();
      voice._simulateSpeechResults(['ignored']);
      expect(callback).not.toHaveBeenCalled();
    });

    it('supports multiple simultaneous subscribers', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      service.subscribe(cb1);
      service.subscribe(cb2);
      await service.startListening();
      voice._simulateSpeechResults(['hi']);
      expect(cb1).toHaveBeenCalledWith('hi');
      expect(cb2).toHaveBeenCalledWith('hi');
    });
  });

  describe('destroy', () => {
    it('calls Voice.destroy', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      await service.destroy();
      expect(voice.destroy).toHaveBeenCalled();
    });

    it('sets isListening to false', async () => {
      const voice = buildVoiceMock();
      const service = new SpeechRecognitionService(voice);
      await service.startListening();
      await service.destroy();
      expect(service.isListening()).toBe(false);
    });
  });
});
