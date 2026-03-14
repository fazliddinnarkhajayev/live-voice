'use strict';

const {
  formatDuration,
  generateRecordingFilename,
  isValidTranscript,
} = require('../utils/audioHelpers');

describe('audioHelpers', () => {
  describe('formatDuration', () => {
    it('formats zero seconds as 00:00', () => {
      expect(formatDuration(0)).toBe('00:00');
    });

    it('formats 65 seconds as 01:05', () => {
      expect(formatDuration(65)).toBe('01:05');
    });

    it('formats 3600 seconds as 60:00', () => {
      expect(formatDuration(3600)).toBe('60:00');
    });

    it('pads single-digit seconds with a leading zero', () => {
      expect(formatDuration(9)).toBe('00:09');
    });

    it('pads single-digit minutes with a leading zero', () => {
      expect(formatDuration(60)).toBe('01:00');
    });

    it('truncates fractional seconds', () => {
      expect(formatDuration(61.9)).toBe('01:01');
    });

    it('throws for negative values', () => {
      expect(() => formatDuration(-1)).toThrow('seconds must be a non-negative number');
    });

    it('throws for NaN', () => {
      expect(() => formatDuration(NaN)).toThrow('seconds must be a non-negative number');
    });

    it('throws for non-number input', () => {
      expect(() => formatDuration('60')).toThrow('seconds must be a non-negative number');
    });
  });

  describe('generateRecordingFilename', () => {
    it('starts with "recording_"', () => {
      const name = generateRecordingFilename(new Date('2026-03-14T10:30:00.000Z'));
      expect(name).toMatch(/^recording_/);
    });

    it('contains the date without colons', () => {
      const name = generateRecordingFilename(new Date('2026-03-14T10:30:00.000Z'));
      expect(name).not.toContain(':');
    });

    it('produces a deterministic result for a fixed date', () => {
      const name = generateRecordingFilename(new Date('2026-03-14T10:30:00.000Z'));
      expect(name).toBe('recording_2026-03-14T10-30-00');
    });

    it('defaults to the current date when no argument is provided', () => {
      const name = generateRecordingFilename();
      // Should match pattern: recording_YYYY-MM-DDTHH-MM-SS
      expect(name).toMatch(/^recording_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
    });
  });

  describe('isValidTranscript', () => {
    it('returns true for a non-empty string', () => {
      expect(isValidTranscript('hello')).toBe(true);
    });

    it('returns false for an empty string', () => {
      expect(isValidTranscript('')).toBe(false);
    });

    it('returns false for a whitespace-only string', () => {
      expect(isValidTranscript('   ')).toBe(false);
    });

    it('returns true for a string with leading/trailing spaces but real content', () => {
      expect(isValidTranscript('  hi  ')).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidTranscript(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidTranscript(undefined)).toBe(false);
    });

    it('returns false for a number', () => {
      expect(isValidTranscript(42)).toBe(false);
    });
  });
});
