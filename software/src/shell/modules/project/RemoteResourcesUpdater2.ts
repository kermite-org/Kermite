import {
  createDictionaryFromKeyValues,
  getObjectKeys,
  IProjectPackageFileContent,
} from '~/shared';
import { appConfig, appEnv } from '~/shell/base';
import {
  fetchJson,
  fsxDeleteFile,
  fsxEnsureFolderExists,
  fsxListFileBaseNames,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  pathJoin,
} from '~/shell/funcs';

interface IProjectPackageWrapperFileContent {
  projectId: string;
  keyboardName: string;
  data: IProjectPackageFileContent;
  dataHash: string;
  authorDisplayName: string;
  authorIconUrl: string;
  revision: number;
  isOfficial: boolean;
}

async function loadLocalDigestMap(
  folderPath: string,
): Promise<Record<string, string>> {
  const projectKeys = await fsxListFileBaseNames(
    folderPath,
    '.kmpkg_wrapper.json',
  );
  return createDictionaryFromKeyValues(
    await Promise.all(
      projectKeys.map(async (projectKey) => {
        const filePath = pathJoin(
          folderPath,
          `${projectKey}.kmpkg_wrapper.json`,
        );
        const content = (await fsxReadJsonFile(
          filePath,
        )) as IProjectPackageWrapperFileContent;
        const { dataHash } = content;
        return [projectKey, dataHash] as [string, string];
      }),
    ),
  );
}

type ICatalogContent = {
  approvals: Record<string, string>;
  reviews: Record<string, string>;
  rereviews: Record<string, string>;
};

async function loadRemoteDigestMap(): Promise<Record<string, string>> {
  const { kermiteServerUrl } = appConfig;
  const catalogContent = (await fetchJson(
    `${kermiteServerUrl}/api/packages/catalog`,
  )) as ICatalogContent;

  const { approvals, reviews, rereviews } = catalogContent;

  const auditing = {
    ...reviews,
    ...rereviews,
  };
  const modAuditing = Object.fromEntries(
    Object.entries(auditing).map(([key, value]) => [`${key}_audit`, value]),
  );
  return {
    ...approvals,
    ...modAuditing,
  };
}

interface IUserApiResponsePartial {
  // id: string;
  displayName: string;
  // comment: string;
  // role: string;
  // loginProvider: string;
  // showLinkId: boolean;
}

interface IApiProjectPackageWrapperItemPartial {
  id: string;
  keyboardName: string;
  projectId: string;
  userId: string;
  data: string; // content of .kmpkg.json
  dataHash: string;
  revision: number;
  official: boolean;
}
interface IApiPackagesProjectsResponse {
  approvals: IApiProjectPackageWrapperItemPartial[];
  reviews: IApiProjectPackageWrapperItemPartial[];
  rereviews: IApiProjectPackageWrapperItemPartial[];
}

async function fetchProjectPackageWrapperItem(
  projectKey: string,
): Promise<IProjectPackageWrapperFileContent> {
  const projectId = projectKey.replace('_audit', '');
  const isAudit = projectKey.endsWith('_audit');
  const data = (await fetchJson(
    `${appConfig.kermiteServerUrl}/api/packages/projects/${projectId}`,
  )) as IApiPackagesProjectsResponse;
  const wrapperItemsSource = isAudit
    ? [...data.reviews, ...data.rereviews]
    : data.approvals;
  const wrapperItem = wrapperItemsSource[wrapperItemsSource.length - 1];

  const {
    keyboardName,
    userId,
    dataHash,
    official: isOfficial,
    revision,
  } = wrapperItem;

  const userInfo = (await fetchJson(
    `${appConfig.kermiteServerUrl}/api/users/${userId}`,
  )) as IUserApiResponsePartial;

  const authorDisplayName = userInfo.displayName;
  const authorIconUrl = `${appConfig.kermiteServerUrl}/api/avatar/${userId}`;

  return {
    projectId,
    keyboardName,
    data: JSON.parse(wrapperItem.data),
    dataHash,
    revision,
    isOfficial,
    authorDisplayName,
    authorIconUrl,
  };
}

async function updateRemotePackagesDifferential(
  remotePackagesFolderPath: string,
  localDigestMap: Record<string, string>,
  remoteDigestMap: Record<string, string>,
) {
  const removedProjectKeys = getObjectKeys(localDigestMap).filter(
    (key) => remoteDigestMap[key] === undefined,
  );
  const updatedProjectKeys = getObjectKeys(remoteDigestMap).filter(
    (key) => !(localDigestMap[key] === remoteDigestMap[key]),
  );
  await Promise.all(
    removedProjectKeys.map(async (projectKey) => {
      const filePath = pathJoin(
        remotePackagesFolderPath,
        `${projectKey}.kmpkg_wrapper.json`,
      );
      await fsxDeleteFile(filePath);
    }),
  );
  await Promise.all(
    updatedProjectKeys.map(async (projectKey) => {
      const wrapperFileContent = await fetchProjectPackageWrapperItem(
        projectKey,
      );
      const filePath = pathJoin(
        remotePackagesFolderPath,
        `${projectKey}.kmpkg_wrapper.json`,
      );
      await fsxWriteJsonFile(filePath, wrapperFileContent);
    }),
  );
  if (updatedProjectKeys.length === 0 && removedProjectKeys.length === 0) {
    console.log('all project packages are up to date');
  }
  if (updatedProjectKeys.length > 0) {
    console.log(`${updatedProjectKeys.length} project packages updated`);
  }
  if (removedProjectKeys.length > 0) {
    console.log(`${removedProjectKeys.length} project packages removed`);
  }
}

export async function remoteResourceUpdater2_updateRemoteProjectPackages() {
  const remotePackagesFolderPath = appEnv.resolveUserDataFilePath(
    'data/kermite_server_projects',
  );
  await fsxEnsureFolderExists(remotePackagesFolderPath);
  console.log('update remote project packages');
  const localDigestMap = await loadLocalDigestMap(remotePackagesFolderPath);
  const remoteDigestMap = await loadRemoteDigestMap();
  // console.log({ localDigestMap, remoteDigestMap });
  await updateRemotePackagesDifferential(
    remotePackagesFolderPath,
    localDigestMap,
    remoteDigestMap,
  );
}
