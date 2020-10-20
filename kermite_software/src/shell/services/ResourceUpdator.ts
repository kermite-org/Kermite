/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import fetch from 'node-fetch';
import { appEnv } from '~shell/base/AppEnvironment';

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  return await res.json();
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  return await res.text();
}

async function ensureDirectoryExists(fpath: string) {
  if (!fs.existsSync(fpath)) {
    await fs.promises.mkdir(fpath, { recursive: true });
  }
}

function isFileExists(fpath: string) {
  return fs.existsSync(fpath);
}

async function readJsonFile(fpath: string) {
  const text = await fs.promises.readFile(fpath, { encoding: 'utf8' });
  return JSON.parse(text);
}

async function writeJsonFile(fpath: string, obj: any) {
  return await fs.promises.writeFile(fpath, JSON.stringify(obj, null, '  '), {
    encoding: 'utf8'
  });
}

async function writeTextFile(fpath: string, text: string) {
  return await fs.promises.writeFile(fpath, text, { encoding: 'utf8' });
}

function excludeArrayItems<T>(arr1: T[], arr2: T[]) {
  return arr1.filter((x) => !arr2.includes(x));
}

async function readJsonFileIfExists(fpath: string) {
  if (isFileExists(fpath)) {
    return await readJsonFile(fpath);
  } else {
    return undefined;
  }
}

async function deleteFile(fpath: string) {
  if (isFileExists(fpath)) {
    await fs.promises.unlink(fpath);
  }
}

async function deleteDirectoryIfBlank(fpath: string) {
  if (isFileExists(fpath)) {
    const files = await fs.promises.readdir(fpath);
    if (files.length === 0) {
      await fs.promises.rmdir(fpath);
    }
  }
}

function globAsync(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) =>
    glob(pattern, (err, matches) => {
      if (err) {
        reject(err);
      }
      resolve(matches);
    })
  );
}

async function removeBlankDirectoriesInTree(baseDir: string) {
  const allTreedFolders = await globAsync(`${baseDir}/**/*/`);
  const allTreedFoldersReverse = allTreedFolders.reverse();
  for (const dirPath of allTreedFoldersReverse) {
    await deleteDirectoryIfBlank(dirPath);
  }
}

interface ISummaryObject {
  info: {
    buildStats: {
      total: number;
      success: number;
    };
    environment: {
      OS: string;
      'avr-gcc': string;
      make: string;
    };
    updatedAt: string;
    filesRevision: number;
  };
  files: { [key: string]: string };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stubSummaryObjectForDevelopment: ISummaryObject = {
  info: {
    buildStats: {
      total: 3,
      success: 3
    },
    environment: {
      OS: 'Mac OS X 10.15.7',
      'avr-gcc': 'Homebrew AVR GCC 9.3.0',
      make: 'GNU Make 3.81'
    },
    updatedAt: '2020-10-14 22:02:05 +0900',
    filesRevision: 8
  },
  files: {
    // 'variants/proto/minivers/minivers.hex': 'd39fb9cb072f7b58184ddd7123df2307',
    // 'variants/proto/minivers/layout.json': 'f520e23b6874986f3f7550a5bdeacc27',
    'variants/proto/minivers/profiles/minivers_test1.json':
      'a7b9c80b2a7bc5429ba57188722ade94',
    'variants/csp/astelia_dev/layout.json': '176f00e13f346f0bd440984a5041ad89',
    'variants/csp/astelia_dev/astelia_dev.hex':
      '2c4b93fe0abb575af8524933cac6adbe',
    'variants/astelia/astelia.hex': 'b13fe2d3629ac845096e8a419ad06a27',
    'variants/astelia/layout.json': '176f00e13f346f0bd440984a5041ad89'
  }
};

async function syncRemoteResourcesToLocalImpl(
  remoteBaseUrl: string,
  localBaseDir: string
) {
  try {
    console.log('updating resources');
    await ensureDirectoryExists(localBaseDir);

    const localSummaryFilePath = `${localBaseDir}/summary.json`;
    const localSummary: ISummaryObject = (await readJsonFileIfExists(
      localSummaryFilePath
    )) || {
      files: {},
      info: {
        filesRevision: 0
      }
    };

    const remoteSummary = (await fetchJson(
      `${remoteBaseUrl}/summary.json`
    )) as ISummaryObject;
    // const remoteSummary = stubSummaryObjectForDevelopment;

    if (remoteSummary.info.filesRevision !== localSummary.info.filesRevision) {
      const remoteEntries = Object.keys(remoteSummary.files);
      const localEntries = Object.keys(localSummary.files);

      const entriesRemoved = excludeArrayItems(localEntries, remoteEntries);
      console.log(`${entriesRemoved.length} entries will be removed`);

      await Promise.all(
        entriesRemoved.map(async (it) => {
          console.log(`remove ${it}`);
          const filePath = `${localBaseDir}/${it}`;
          await deleteFile(filePath);
        })
      );

      const entriesUpdated = remoteEntries.filter(
        (it) =>
          localSummary.files[it] !== remoteSummary.files[it] ||
          !isFileExists(`${localBaseDir}/${it}`)
      );
      console.log(`${entriesUpdated.length} entries will be updated`);
      for (const it of entriesUpdated) {
        console.log(`fetch ${it}`);
        const content = await fetchText(`${remoteBaseUrl}/${it}`);
        const localFilePath = `${localBaseDir}/${it}`;
        await ensureDirectoryExists(path.dirname(localFilePath));
        await writeTextFile(localFilePath, content);
      }

      await removeBlankDirectoriesInTree(localBaseDir);

      await writeJsonFile(localSummaryFilePath, remoteSummary);
      console.log('now resources are up to date');
    } else {
      console.log('resources are up to date');
    }
  } catch (error) {
    console.log(error);
  }
}

export async function resourceUpdator_syncRemoteResourcesToLocal() {
  const remoteDir =
    'https://raw.githubusercontent.com/yahiro07/KermiteResourceStore/master/resources';
  const localDir = appEnv.resolveUserDataFilePath('resources');
  await syncRemoteResourcesToLocalImpl(remoteDir, localDir);
}