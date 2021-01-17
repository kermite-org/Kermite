import fs from 'fs';
import { debounce } from '@shared';
import {
  fsWatch,
  pathExtname,
  pathJoin,
  pathRelative,
  pathResolve,
} from '@shell/funcs';

export class PageSourceWatcher {
  private watcher: fs.FSWatcher | undefined;

  observeFiles(
    pageDir: string,
    includeSubFolders: boolean,
    notificationCallback: () => void,
  ) {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = undefined;
    }
    const debouncedNotify = debounce(notificationCallback, 200);

    this.watcher = fsWatch(
      pageDir,
      { recursive: includeSubFolders },
      (_event, fileName) => {
        const ext = pathExtname(fileName);
        if (['.js', '.html'].includes(ext)) {
          const relPathFromProjectRoot = pathRelative(
            pathResolve(),
            pathJoin(pageDir, fileName),
          );
          console.log(`file changed: ${relPathFromProjectRoot}`);
          debouncedNotify();
        }
      },
    );
  }
}
