import * as crypto from 'crypto';
import { createDictionaryFromKeyValues, getObjectKeys } from '~/shared';
import { appConfig, appEnv } from '~/shell/base';
import {
  fetchJson,
  fetchText,
  fsxDeleteFile,
  fsxEnsureFolderExists,
  fsxReaddir,
  fsxReadFile,
  fsxWriteFile,
  pathBasename,
  pathJoin,
} from '~/shell/funcs';

type IIndexContent = {
  files: Record<string, string>;
};

function generateMd5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}

async function loadLocalDigestMap(
  folderPath: string,
): Promise<Record<string, string>> {
  const fileNames = (await fsxReaddir(folderPath)).filter((it) =>
    it.endsWith('.kmpkg.json'),
  );
  return createDictionaryFromKeyValues(
    await Promise.all(
      fileNames.map(async (fileName) => {
        const filePath = pathJoin(folderPath, fileName);
        const content = await fsxReadFile(filePath);
        const md5 = generateMd5(content);
        return [fileName, md5] as [string, string];
      }),
    ),
  );
}

async function loadRemoteDigestMap(
  onlineResourcesBaseUrl: string,
): Promise<Record<string, string>> {
  const indexContent = (await fetchJson(
    `${onlineResourcesBaseUrl}/index.json`,
  )) as IIndexContent;

  return createDictionaryFromKeyValues(
    getObjectKeys(indexContent.files)
      .filter((key) => key.endsWith('.kmpkg.json'))
      .map((key) => {
        const fileName = pathBasename(key);
        const md5 = indexContent.files[key];
        return [fileName, md5];
      }),
  );
}

export async function remoteResourceUpdater_updateRemoteProjectPackages_deprecated() {
  const { onlineResourcesBaseUrl } = appConfig;
  const remotePackagesFolderPath = appEnv.resolveUserDataFilePath(
    'data/remote_projects',
  );
  await fsxEnsureFolderExists(remotePackagesFolderPath);

  console.log('update remote project packages');

  const localDigestMap = await loadLocalDigestMap(remotePackagesFolderPath);
  const remoteDigestMap = await loadRemoteDigestMap(onlineResourcesBaseUrl);

  const removedFileNames = getObjectKeys(localDigestMap).filter(
    (key) => remoteDigestMap[key] === undefined,
  );
  const updatedFileNames = getObjectKeys(remoteDigestMap).filter(
    (key) => !(localDigestMap[key] === remoteDigestMap[key]),
  );
  await Promise.all(
    removedFileNames.map(async (fileName) => {
      const filePath = pathJoin(remotePackagesFolderPath, fileName);
      await fsxDeleteFile(filePath);
    }),
  );
  await Promise.all(
    updatedFileNames.map(async (fileName) => {
      const data = await fetchText(
        `${onlineResourcesBaseUrl}/projects/${fileName}`,
      );
      const filePath = pathJoin(remotePackagesFolderPath, fileName);
      await fsxWriteFile(filePath, data);
    }),
  );
  if (updatedFileNames.length === 0 && removedFileNames.length === 0) {
    console.log('all project packages are up to date');
  }
  if (updatedFileNames.length > 0) {
    console.log(`${updatedFileNames.length} project packages updated`);
  }
  if (removedFileNames.length > 0) {
    console.log(`${removedFileNames.length} project packages removed`);
  }
}
