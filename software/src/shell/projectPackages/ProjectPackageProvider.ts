import {
  IProjectPackageFileContent,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  fetchJson,
  fsxListFileBaseNames,
  fsxReadJsonFile,
  fsxWriteJsonFile,
  pathBasename,
  pathJoin,
} from '~/shell/funcs';

interface IProjectPackageProvider {
  getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]>;
  saveLocalProjectPackageInfo(info: IProjectPackageInfo): Promise<void>;
}

function convertPackageFileContentToPackageInfo(
  data: IProjectPackageFileContent,
  origin: IResourceOrigin,
  packageName: string,
): IProjectPackageInfo {
  return {
    sig: `${origin}#${data.projectId}`,
    origin,
    packageName,
    ...data,
  };
}

async function loadProjectPackageFiles(
  folderPath: string,
  origin: IResourceOrigin,
): Promise<IProjectPackageInfo[]> {
  const packageNames = await fsxListFileBaseNames(folderPath, '.kmpkg.json');
  return await Promise.all(
    packageNames.map(async (packageName) => {
      const filePath = pathJoin(folderPath, packageName + '.kmpkg.json');
      const data = (await fsxReadJsonFile(
        filePath,
      )) as IProjectPackageFileContent;
      return convertPackageFileContentToPackageInfo(data, origin, packageName);
    }),
  );
}

type IIndexContent = {
  files: Record<string, string>;
};

async function loadRemoteProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const remoteBaseUrl = 'https://app.kermite.org/krs/resources2';
  const indexContent = (await fetchJson(
    `${remoteBaseUrl}/index.json`,
  )) as IIndexContent;
  const origin = 'online' as const;

  const targetPaths = Object.keys(indexContent.files).filter((it) =>
    it.endsWith('.kmpkg.json'),
  );
  return await Promise.all(
    targetPaths.map(async (path) => {
      const data = (await fetchJson(
        `${remoteBaseUrl}/${path}`,
      )) as IProjectPackageFileContent;
      const packageName = pathBasename(path, '.kmpkg.json');
      return convertPackageFileContentToPackageInfo(data, origin, packageName);
    }),
  );
}

async function loadLocalProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const projectsFolder = pathJoin(
    appEnv.userDataFolderPath,
    'data',
    'projects',
  );
  return await loadProjectPackageFiles(projectsFolder, 'local');
}

async function saveLocalProjectPackgeInfoImpl(info: IProjectPackageInfo) {
  const filePath = pathJoin(
    appEnv.userDataFolderPath,
    'data',
    'projects',
    `${info.packageName}.kmpkg.json`,
  );
  await fsxWriteJsonFile(filePath, info);
}
export class ProjectPackageProvider implements IProjectPackageProvider {
  private cached: IProjectPackageInfo[] | undefined;

  async getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
    if (!this.cached) {
      this.cached = [
        ...(await loadRemoteProjectPackageInfos()),
        ...(await loadLocalProjectPackageInfos()),
      ];
    }
    return this.cached;
  }

  async saveLocalProjectPackageInfo(info: IProjectPackageInfo): Promise<void> {
    await saveLocalProjectPackgeInfoImpl(info);
  }
}

export const projectPackageProvider = new ProjectPackageProvider();
