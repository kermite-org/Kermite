import {
  IPersistKeyboardDesign,
  IPersistProfileData,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { fsxListFileBaseNames, fsxReadJsonFile, pathJoin } from '~/shell/funcs';
import { globalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';

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

async function loadLocalProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const localRepositoryDir = globalSettingsProvider.getLocalRepositoryDir();
  if (!localRepositoryDir) {
    return [];
  }
  const packagesRoot = pathJoin(localRepositoryDir, 'firmware/projects_next');
  const packageNames = await fsxListFileBaseNames(packagesRoot, '.kmpkg.json');

  const origin: IResourceOrigin = 'online';
  return await Promise.all(
    packageNames.map(async (packageName) => {
      const filePath = pathJoin(packagesRoot, packageName + '.kmpkg.json');
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

export class ProjectPackageProvider implements IProjectPackageProvider {
  private cached: IProjectPackageInfo[] | undefined;

  async getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
    if (!this.cached) {
      this.cached = await loadLocalProjectPackageInfos();
    }
    return this.cached;
  }
}

export const projectPackageProvider = new ProjectPackageProvider();
