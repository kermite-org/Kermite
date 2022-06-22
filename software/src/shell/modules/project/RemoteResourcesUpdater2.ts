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
  isDevelopment: boolean;
  timeStamp: number;
}

function loadLocalDigestMap(folderPath: string): Record<string, number> {
  const projectKeys = fsxListFileBaseNames(folderPath, '.kmpkg_wrapper.json');
  return createDictionaryFromKeyValues(
    projectKeys.map((projectKey) => {
      const filePath = pathJoin(folderPath, `${projectKey}.kmpkg_wrapper.json`);
      const content = fsxReadJsonFile(
        filePath,
      ) as IProjectPackageWrapperFileContent;
      const { timeStamp } = content;
      return [projectKey, timeStamp] as [string, number];
    }),
  );
}

interface IApiGetPackagesCatalogResponsePackagesItem {
  projectId: string;
  status: 'Review' | 'Approval' | 'Rereview';
  timeStamp: number;
  // revision: number;
  // datahash: string;
}

type IApiGetPackagesCatalogResponse = {
  packages: IApiGetPackagesCatalogResponsePackagesItem[];
};

async function loadRemoteDigestMap(): Promise<Record<string, number>> {
  const { kermiteServerUrl } = appConfig;
  const catalogContent = (await fetchJson(
    `${kermiteServerUrl}/api/packages/catalog`,
  )) as IApiGetPackagesCatalogResponse;

  const modPackages = catalogContent.packages.map((pkg) => ({
    projectId:
      pkg.status === 'Review' || pkg.status === 'Rereview'
        ? `${pkg.projectId}_audit`
        : pkg.projectId,
    timeStamp: pkg.timeStamp,
  }));

  return Object.fromEntries(
    modPackages.map((pkg) => [pkg.projectId, pkg.timeStamp]),
  );
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
  development: boolean;
}
interface IApiPackagesProjectsResponse {
  approvals: IApiProjectPackageWrapperItemPartial[];
  reviews: IApiProjectPackageWrapperItemPartial[];
  rereviews: IApiProjectPackageWrapperItemPartial[];
}

async function fetchProjectPackageWrapperItem(
  projectKey: string,
  timeStamp: number,
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
    development: isDevelopment,
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
    isDevelopment,
    authorDisplayName,
    authorIconUrl,
    timeStamp,
  };
}

function updateRemotePackagesDifferential(
  remotePackagesFolderPath: string,
  localDigestMap: Record<string, number>,
  remoteDigestMap: Record<string, number>,
) {
  const removedProjectKeys = getObjectKeys(localDigestMap).filter(
    (key) => remoteDigestMap[key] === undefined,
  );
  const updatedProjectKeys = getObjectKeys(remoteDigestMap).filter(
    (key) => !(localDigestMap[key] === remoteDigestMap[key]),
  );
  removedProjectKeys.map(async (projectKey) => {
    const filePath = pathJoin(
      remotePackagesFolderPath,
      `${projectKey}.kmpkg_wrapper.json`,
    );
    fsxDeleteFile(filePath);
  });
  updatedProjectKeys.map(async (projectKey) => {
    const timeStamp = remoteDigestMap[projectKey];
    const wrapperFileContent = await fetchProjectPackageWrapperItem(
      projectKey,
      timeStamp,
    );
    const filePath = pathJoin(
      remotePackagesFolderPath,
      `${projectKey}.kmpkg_wrapper.json`,
    );
    fsxWriteJsonFile(filePath, wrapperFileContent);
  });
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
  fsxEnsureFolderExists(remotePackagesFolderPath);
  console.log('update remote project packages');
  const localDigestMap = loadLocalDigestMap(remotePackagesFolderPath);
  const remoteDigestMap = await loadRemoteDigestMap();
  updateRemotePackagesDifferential(
    remotePackagesFolderPath,
    localDigestMap,
    remoteDigestMap,
  );
}
