import { memoryFileSystem } from '~/memoryFileSystem';

export namespace ApplicationMemoryFilesMigrator {
  const configs = {
    dryRun: false,
  };
  // configs.dryRun = true;  //for development

  type IRenameEntry = {
    srcPath: string;
    modPath: string;
  };

  function renameVirtualFiles(
    renameEntries: IRenameEntry[],
    options?: { dryRun: boolean },
  ) {
    for (const renameEntry of renameEntries) {
      const { srcPath, modPath } = renameEntry;
      console.log(`rename virtual file, ${srcPath} --> ${modPath}`);
      if (!options?.dryRun) {
        memoryFileSystem.renameFile(srcPath, modPath);
      }
    }
  }

  function migrateRevision1To2() {
    const renameEntries: IRenameEntry[] = [];
    const fileItems = memoryFileSystem.getAllFileEntities();

    function registerExtensionChange(
      srcPath: string,
      srcExtension: string,
      dstExtension: string,
    ) {
      if (srcPath.endsWith(srcExtension)) {
        const modPath = srcPath.replace(srcExtension, dstExtension);
        renameEntries.push({ srcPath, modPath });
      }
    }
    for (const file of fileItems) {
      const { path } = file;
      registerExtensionChange(path, '.kmpkg_wrapper.json', '.kmpkg_wrapper');
      registerExtensionChange(path, '.kmpkg.json', '.kmpkg');
      registerExtensionChange(path, '.profile.json', '.kmprf');
    }

    if (configs.dryRun) {
      console.log(`dry run memory files migration, revision 1 to 2`);
      renameVirtualFiles(renameEntries, { dryRun: true });
    } else {
      console.log(`migrate memory files, revision 1 to 2`);
      renameVirtualFiles(renameEntries);
      memoryFileSystem.setMemoryStorageRevision(2);
      console.log({
        memoryStorageRevision: memoryFileSystem.memoryStorageRevision,
      });
      console.log(memoryFileSystem.getAllFileEntities());
    }
  }

  export function migrateFileEntities() {
    const { memoryStorageRevision } = memoryFileSystem;

    if (memoryStorageRevision === 1) {
      migrateRevision1To2();
    }
  }
}
