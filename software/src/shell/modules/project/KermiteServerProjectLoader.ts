import {
  createProjectKey,
  IOnlineProjectAttributes,
  IProjectPackageFileContent,
  IProjectPackageInfo,
} from '~/shared';
import { appEnv } from '~/shell/base';
import { fsxListFileBaseNames, fsxReadJsonFile, pathJoin } from '~/shell/funcs';
import { migrateProjectPackageData } from '~/shell/loaders/ProjectPackageDataMigrator';

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
  isAudit: boolean,
): IProjectPackageInfo {
  const { keyboardName } = data;
  const packageName = keyboardName.toLowerCase();
  const origin = isAudit ? 'online_audit' : 'online';
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
): Promise<IProjectPackageInfo[]> {
  const projectKeys = await fsxListFileBaseNames(
    folderPath,
    '.kmpkg_wrapper.json',
  );
  const items = (
    await Promise.all(
      projectKeys.map(async (projectKey) => {
        const isAudit = projectKey.endsWith('_audit');
        const filePath = pathJoin(
          folderPath,
          `${projectKey}.kmpkg_wrapper.json`,
        );
        const wrapperItem = (await fsxReadJsonFile(
          filePath,
        )) as IProjectPackageWrapperFileContent;

        const packageFileContent = wrapperItem.data;

        migrateProjectPackageData(packageFileContent);
        if (!checkProjectFileContentSchema(packageFileContent)) {
          console.log(`invalid online package ${projectKey}`);
          return undefined;
        }

        const {
          authorDisplayName,
          authorIconUrl,
          isOfficial,
          isDevelopment,
          revision,
        } = wrapperItem;
        const attrs: IOnlineProjectAttributes = {
          authorDisplayName,
          authorIconUrl,
          isOfficial,
          isDevelopment,
          revision,
        };
        return convertOnlinePackageDataToPackageInfo(
          packageFileContent,
          attrs,
          isAudit,
        );
      }),
    )
  ).filter((it) => it) as IProjectPackageInfo[];
  return items;
}

let cachedRemotePackages: IProjectPackageInfo[] | undefined;

export async function loadKermiteServerProjectPackageInfos(): Promise<
  IProjectPackageInfo[]
> {
  if (!cachedRemotePackages) {
    const remotePackagesLocalFolderPath = appEnv.resolveUserDataFilePath(
      'data/kermite_server_projects',
    );
    cachedRemotePackages = await loadProjectPackageWrapperFiles(
      remotePackagesLocalFolderPath,
    );
  }
  return cachedRemotePackages;
}