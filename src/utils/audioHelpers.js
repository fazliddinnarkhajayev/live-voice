/**
 * Utility helpers for the Live Voice app.
 */

/**
 * Formats a duration given in seconds into a human-readable MM:SS string.
 *
 * @param {number} seconds - Duration in seconds (non-negative integer)
 * @returns {string} Formatted string e.g. "01:05"
 */
function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    throw new Error('seconds must be a non-negative number');
  }
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Generates a timestamped filename for a recording.
 *
 * @param {Date} [date] - Date to use (defaults to now)
 * @returns {string} Filename like "recording_2026-03-14T10-30-00"
 */
function generateRecordingFilename(date) {
  const d = date || new Date();
  const iso = d.toISOString().replace(/:/g, '-').split('.')[0];
  return `recording_${iso}`;
}

/**
 * Returns true when the transcript string is non-empty after trimming.
 *
 * @param {string} transcript
 * @returns {boolean}
 */
function isValidTranscript(transcript) {
  return typeof transcript === 'string' && transcript.trim().length > 0;
}

module.exports = { formatDuration, generateRecordingFilename, isValidTranscript };
