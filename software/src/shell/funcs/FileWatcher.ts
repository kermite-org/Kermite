import fs from 'fs';

export class FileWather {
  private watcher: fs.FSWatcher | undefined;

  private _targetFilePath: string | undefined;

  get targetFilePath() {
    return this._targetFilePath;
  }

  observeFile(filePath: string, listener: () => void) {
    this._targetFilePath = filePath;
    this.unobserveFile();
    this.watcher = fs.watch(filePath, {}, listener);
  }

  unobserveFile() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }
  }
}
