import * as crypto from 'crypto';
import { createDictionaryFromKeyValues, getObjectKeys } from '~/shared';
import { appConfig, appConfigDebug, appEnv } from '~/shell/base';
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

function generateMd5(str: string) {
  return crypto.createHash('md5').update(str).digest('hex');
}

async function loadLocalDigestMap(
  folderPath: string,
): Promise<Record<string, string>> {
  const fileNames = (await fsxReaddir(folderPath)).filter((it) =>
    it.endsWith('.kmpkg_wrapper.json'),
  );
  return createDictionaryFromKeyValues(
    await Promise.all(
      fileNames.map(async (fileName) => {
        const filePath = pathJoin(folderPath, fileName);
        const content = await fsxReadFile(filePath);
        const md5 = generateMd5(content);
        const packageName = pathBasename(fileName, '.kmpkg_wrapper.json');
        return [packageName, md5] as [string, string];
      }),
    ),
  );
}

type ICatalogContent = {
  approvals: Record<string, string>;
  reviews: Record<string, string>;
  rereviews: Record<string, string>;
};

async function loadRemoteDigestMap(
  includeReviewing: boolean,
): Promise<Record<string, string>> {
  const { kermiteServerUrl } = appConfig;
  const catalogContent = (await fetchJson(
    `${kermiteServerUrl}/api/packages/catalog`,
  )) as ICatalogContent;

  const { approvals, reviews, rereviews } = catalogContent;

  return includeReviewing
    ? {
        ...approvals,
        ...reviews,
        ...rereviews,
      }
    : approvals;
}

async function updateRemotePackagesDifferential(
  remotePackagesFolderPath: string,
  localDigestMap: Record<string, string>,
  remoteDigestMap: Record<string, string>,
) {
  const removedProjectIds = getObjectKeys(localDigestMap).filter(
    (key) => remoteDigestMap[key] === undefined,
  );
  const updatedProjectIds = getObjectKeys(remoteDigestMap).filter(
    (key) => !(localDigestMap[key] === remoteDigestMap[key]),
  );
  await Promise.all(
    removedProjectIds.map(async (projectId) => {
      const filePath = pathJoin(
        remotePackagesFolderPath,
        `${projectId}.kmpkg_wrapper.json`,
      );
      await fsxDeleteFile(filePath);
    }),
  );
  await Promise.all(
    updatedProjectIds.map(async (projectId) => {
      const data = await fetchText(
        `${appConfig.kermiteServerUrl}/api/packages/projects/${projectId}`,
      );
      const filePath = pathJoin(
        remotePackagesFolderPath,
        `${projectId}.kmpkg_wrapper.json`,
      );
      await fsxWriteFile(filePath, data);
    }),
  );
  if (updatedProjectIds.length === 0 && removedProjectIds.length === 0) {
    console.log('all project packages are up to date');
  }
  if (updatedProjectIds.length > 0) {
    console.log(`${updatedProjectIds.length} project packages updated`);
  }
  if (removedProjectIds.length > 0) {
    console.log(`${removedProjectIds.length} project packages removed`);
  }
}

export async function remoteResourceUpdater2_updateRemoteProjectPackages() {
  const remotePackagesFolderPath = appEnv.resolveUserDataFilePath(
    'data/kermite_server_projects',
  );
  await fsxEnsureFolderExists(remotePackagesFolderPath);
  console.log('update remote project packages');
  const localDigestMap = await loadLocalDigestMap(remotePackagesFolderPath);
  const remoteDigestMap = await loadRemoteDigestMap(
    appConfigDebug.reviewerMode,
  );
  console.log({ localDigestMap, remoteDigestMap });
  await updateRemotePackagesDifferential(
    remotePackagesFolderPath,
    localDigestMap,
    remoteDigestMap,
  );
}
