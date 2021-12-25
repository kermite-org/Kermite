import {
  createProjectKey,
  IOnlineProjectAttributes,
  IProjectPackageFileContent,
  IProjectPackageInfo,
  uniqueArrayItemsByField,
} from '~/shared';
import { appConfig, appConfigDebug, appEnv } from '~/shell/base';
import {
  fetchJson,
  fsxListFileBaseNames,
  fsxReadJsonFile,
  pathJoin,
} from '~/shell/funcs';
import { migrateProjectPackageData } from '~/shell/loaders/ProjectPackageDataMigrator';

interface IProjectPackageWrapperPackageItemPartial {
  id: string;
  // keyboardName: string;
  // projectId: string;
  userId: string;
  data: string; // content of .kmpkg.json
  // dataHash: string;
  revision: number;
  official: boolean;
}

interface IUserApiResponsePartial {
  // id: string;
  displayName: string;
  // comment: string;
  // role: string;
  // loginProvider: string;
  // showLinkId: boolean;
}

interface IProjectPackageWrapperFileContent {
  approvals: IProjectPackageWrapperPackageItemPartial[];
  reviews: IProjectPackageWrapperPackageItemPartial[];
  rereviews: IProjectPackageWrapperPackageItemPartial[];
}

function checkProjectFileContentSchema(
  data: IProjectPackageFileContent,
): boolean {
  return (
    data.formatRevision === 'PKG0' &&
    data.keyboardName !== undefined &&
    data.projectId !== undefined &&
    Array.isArray(data.firmwares) &&
    Array.isArray(data.layouts) &&
    Array.isArray(data.profiles)
  );
}

function convertOnlinePackageDataToPackageInfo(
  data: IProjectPackageFileContent,
  onlineProjectAttributes: IOnlineProjectAttributes,
): IProjectPackageInfo {
  const { keyboardName } = data;
  const packageName = keyboardName.toLowerCase();
  const origin = 'online';
  return {
    ...data,
    projectKey: createProjectKey(origin, data.projectId),
    origin,
    packageName,
    keyboardName,
    onlineProjectAttributes,
  };
}

async function loadProjectPackageWrapperFiles(
  folderPath: string,
  reviewerMode: boolean,
): Promise<IProjectPackageInfo[]> {
  const projectIds = await fsxListFileBaseNames(
    folderPath,
    '.kmpkg_wrapper.json',
  );
  const items = (
    await Promise.all(
      projectIds.map(async (projectId) => {
        const filePath = pathJoin(
          folderPath,
          `${projectId}.kmpkg_wrapper.json`,
        );
        const wrapperContent = (await fsxReadJsonFile(
          filePath,
        )) as IProjectPackageWrapperFileContent;

        const wrapperItems = reviewerMode
          ? [
              ...wrapperContent.approvals,
              ...wrapperContent.reviews,
              ...wrapperContent.rereviews,
            ]
          : wrapperContent.approvals;
        const wrapperItem = wrapperItems[wrapperItems.length - 1];

        const packageFileContent = JSON.parse(
          wrapperItem.data,
        ) as IProjectPackageFileContent;
        migrateProjectPackageData(packageFileContent);
        if (!checkProjectFileContentSchema(packageFileContent)) {
          console.log(`invalid online package ${projectId}`);
          return undefined;
        }
        const { userId, official, revision } = wrapperItem;

        const userInfo = (await fetchJson(
          `${appConfig.kermiteServerUrl}/api/users/${userId}`,
        )) as IUserApiResponsePartial;

        const attrs: IOnlineProjectAttributes = {
          authorDisplayName: userInfo.displayName,
          authorIconUrl: `${appConfig.kermiteServerUrl}/api/avatar/${userId}`,
          isOfficial: official,
          revision,
        };

        return convertOnlinePackageDataToPackageInfo(packageFileContent, attrs);
      }),
    )
  ).filter((it) => it) as IProjectPackageInfo[];
  return uniqueArrayItemsByField(items, 'projectId');
}

let cachedRemotePackages: IProjectPackageInfo[] | undefined;

export async function loadKermiteServerProjectPackageInfos(): Promise<
  IProjectPackageInfo[]
> {
  if (!cachedRemotePackages) {
    const remotePackagesLocalFolderPath = appEnv.resolveUserDataFilePath(
      'data/kermite_server_projects',
    );
    const { reviewerMode } = appConfigDebug;
    cachedRemotePackages = await loadProjectPackageWrapperFiles(
      remotePackagesLocalFolderPath,
      reviewerMode,
    );
  }
  return cachedRemotePackages;
}
