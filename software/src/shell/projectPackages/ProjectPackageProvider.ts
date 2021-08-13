import {
  IPersistKeyboardDesign,
  IPersistProfileData,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  fetchJson,
  fsxListFileBaseNames,
  fsxReadJsonFile,
  pathJoin,
} from '~/shell/funcs';

interface IProjectPackageProvider {
  getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]>;
}

interface IProjectPackageFileContent {
  projectId: string;
  keyboardName: string;
  customFirmwareReferences: {
    variantName: string;
    firmwareId: string;
    systemParameterKeys: string[];
  }[];
  layouts: {
    layoutName: string;
    data: IPersistKeyboardDesign;
  }[];
  profiles: {
    profileName: string;
    data: IPersistProfileData;
  }[];
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
      return {
        sig: `${origin}#${data.projectId}`,
        origin,
        ...data,
      };
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
      return {
        sig: `${origin}#${data.projectId}`,
        origin,
        ...data,
      };
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
}

export const projectPackageProvider = new ProjectPackageProvider();
