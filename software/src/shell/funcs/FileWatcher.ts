import fs from 'fs';

export class FileWather {
  private watcher: fs.FSWatcher | undefined;

  observeFile(filePath: string, listener: () => void) {
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
