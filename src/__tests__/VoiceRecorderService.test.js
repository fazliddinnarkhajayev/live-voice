'use strict';

const VoiceRecorderService = require('../services/VoiceRecorderService');

/**
 * Build a minimal fs mock that can be configured per test.
 */
function buildFsMock({ dirExists = false } = {}) {
  return {
    exists: jest.fn().mockResolvedValue(dirExists),
    mkdir: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
  };
}

describe('VoiceRecorderService', () => {
  describe('initial state', () => {
    it('is not recording when first created', () => {
      const service = new VoiceRecorderService(buildFsMock());
      expect(service.isRecording()).toBe(false);
    });

    it('has no current file when first created', () => {
      const service = new VoiceRecorderService(buildFsMock());
      expect(service.getCurrentFile()).toBeNull();
    });

    it('has an empty recordings list when first created', () => {
      const service = new VoiceRecorderService(buildFsMock());
      expect(service.getRecordings()).toEqual([]);
    });
  });

  describe('startRecording', () => {
    it('sets isRecording to true', async () => {
      const service = new VoiceRecorderService(buildFsMock({ dirExists: true }));
      await service.startRecording('test');
      expect(service.isRecording()).toBe(true);
    });

    it('returns the path of the new file', async () => {
      const service = new VoiceRecorderService(buildFsMock({ dirExists: true }));
      const path = await service.startRecording('hello');
      expect(path).toBe('/recordings/hello.wav');
    });

    it('creates the recordings directory if it does not exist', async () => {
      const fs = buildFsMock({ dirExists: false });
      const service = new VoiceRecorderService(fs);
      await service.startRecording('test');
      expect(fs.mkdir).toHaveBeenCalledWith('/recordings');
    });

    it('does not create the directory if it already exists', async () => {
      const fs = buildFsMock({ dirExists: true });
      const service = new VoiceRecorderService(fs);
      await service.startRecording('test');
      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    it('throws when a recording is already in progress', async () => {
      const service = new VoiceRecorderService(buildFsMock({ dirExists: true }));
      await service.startRecording('first');
      await expect(service.startRecording('second')).rejects.toThrow(
        'A recording is already in progress',
      );
    });

    it('throws when filename is empty', async () => {
      const service = new VoiceRecorderService(buildFsMock());
      await expect(service.startRecording('')).rejects.toThrow(
        'Filename must not be empty',
      );
    });

    it('throws when filename is only whitespace', async () => {
      const service = new VoiceRecorderService(buildFsMock());
      await expect(service.startRecording('   ')).rejects.toThrow(
        'Filename must not be empty',
      );
    });
  });

  describe('stopRecording', () => {
    it('sets isRecording to false', async () => {
      const service = new VoiceRecorderService(buildFsMock({ dirExists: true }));
      await service.startRecording('test');
      await service.stopRecording();
      expect(service.isRecording()).toBe(false);
    });

    it('returns the path that was being recorded', async () => {
      const service = new VoiceRecorderService(buildFsMock({ dirExists: true }));
      await service.startRecording('session1');
      const saved = await service.stopRecording();
      expect(saved).toBe('/recordings/session1.wav');
    });

    it('clears the current file after stopping', async () => {
      const service = new VoiceRecorderService(buildFsMock({ dirExists: true }));
      await service.startRecording('session1');
      await service.stopRecording();
      expect(service.getCurrentFile()).toBeNull();
    });

    it('adds the recording to the recordings list', async () => {
      const service = new VoiceRecorderService(buildFsMock({ dirExists: true }));
      await service.startRecording('session1');
      await service.stopRecording();
      expect(service.getRecordings()).toContain('/recordings/session1.wav');
    });

    it('accumulates multiple recordings', async () => {
      const service = new VoiceRecorderService(buildFsMock({ dirExists: true }));
      await service.startRecording('a');
      await service.stopRecording();
      await service.startRecording('b');
      await service.stopRecording();
      expect(service.getRecordings()).toEqual([
        '/recordings/a.wav',
        '/recordings/b.wav',
      ]);
    });

    it('throws when no recording is in progress', async () => {
      const service = new VoiceRecorderService(buildFsMock());
      await expect(service.stopRecording()).rejects.toThrow(
        'No recording is in progress',
      );
    });
  });

  describe('deleteRecording', () => {
    it('removes the file and clears it from the list', async () => {
      const fs = buildFsMock({ dirExists: true });
      fs.exists.mockResolvedValueOnce(true) // recordings dir check in startRecording
                .mockResolvedValueOnce(true); // exists check in deleteRecording
      const service = new VoiceRecorderService(fs);
      await service.startRecording('session1');
      await service.stopRecording();
      await service.deleteRecording('/recordings/session1.wav');
      expect(fs.unlink).toHaveBeenCalledWith('/recordings/session1.wav');
      expect(service.getRecordings()).not.toContain('/recordings/session1.wav');
    });

    it('throws when the file does not exist', async () => {
      const fs = buildFsMock({ dirExists: false });
      const service = new VoiceRecorderService(fs);
      await expect(service.deleteRecording('/recordings/missing.wav')).rejects.toThrow(
        'Recording not found: /recordings/missing.wav',
      );
    });
  });

  describe('getRecordings', () => {
    it('returns a copy of the list so external mutation does not affect the service', async () => {
      const service = new VoiceRecorderService(buildFsMock({ dirExists: true }));
      await service.startRecording('test');
      await service.stopRecording();
      const list = service.getRecordings();
      list.push('/recordings/injected.wav');
      expect(service.getRecordings()).toHaveLength(1);
    });
  });
});
