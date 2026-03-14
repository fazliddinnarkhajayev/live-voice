/**
 * VoiceRecorderService
 *
 * Manages voice recording sessions: start, stop, and listing recordings.
 * Delegates file I/O to the injected `fs` module so the service is
 * fully testable without a real device file-system.
 */

const RECORDINGS_DIR = '/recordings';

class VoiceRecorderService {
  constructor(fs) {
    this._fs = fs;
    this._isRecording = false;
    this._currentFile = null;
    this._recordings = [];
  }

  isRecording() {
    return this._isRecording;
  }

  getCurrentFile() {
    return this._currentFile;
  }

  async startRecording(filename) {
    if (this._isRecording) {
      throw new Error('A recording is already in progress');
    }
    if (!filename || !filename.trim()) {
      throw new Error('Filename must not be empty');
    }

    const dirExists = await this._fs.exists(RECORDINGS_DIR);
    if (!dirExists) {
      await this._fs.mkdir(RECORDINGS_DIR);
    }

    this._currentFile = `${RECORDINGS_DIR}/${filename}.wav`;
    this._isRecording = true;
    return this._currentFile;
  }

  async stopRecording() {
    if (!this._isRecording) {
      throw new Error('No recording is in progress');
    }

    const savedFile = this._currentFile;
    this._recordings.push(savedFile);
    this._isRecording = false;
    this._currentFile = null;
    return savedFile;
  }

  async deleteRecording(filepath) {
    const exists = await this._fs.exists(filepath);
    if (!exists) {
      throw new Error(`Recording not found: ${filepath}`);
    }
    await this._fs.unlink(filepath);
    this._recordings = this._recordings.filter(r => r !== filepath);
  }

  getRecordings() {
    return [...this._recordings];
  }
}

module.exports = VoiceRecorderService;
