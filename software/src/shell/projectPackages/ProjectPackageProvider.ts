import {
  IPersistKeyboardDesign,
  IPersistProfileData,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  fsxListFileBaseNames,
  fsxReadJsonFile,
  pathJoin,
  pathResolve,
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

async function loadMasterProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const packagesRoot = pathResolve('../firmware/projects_next');
  return await loadProjectPackageFiles(packagesRoot, 'online');
}

async function loadLocalProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const projectsFolder = pathJoin(appEnv.useDataFolderPath, 'data', 'projects');
  return await loadProjectPackageFiles(projectsFolder, 'local');
}
export class ProjectPackageProvider implements IProjectPackageProvider {
  private cached: IProjectPackageInfo[] | undefined;

  async getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
    if (!this.cached) {
      this.cached = [
        ...(await loadMasterProjectPackageInfos()),
        ...(await loadLocalProjectPackageInfos()),
      ];
    }
    return this.cached;
  }
}

export const projectPackageProvider = new ProjectPackageProvider();
