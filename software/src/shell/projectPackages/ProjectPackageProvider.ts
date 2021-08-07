import { IProjectPackageInfo } from '~/shared';
import { fsxListFileBaseNames, fsxReadJsonFile, pathJoin } from '~/shell/funcs';
import { globalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';

interface IProjectPackageProvider {
  getAllProjectPackageInfos(): Promise<IProjectPackageInfo[]>;
}

async function loadLocalProjectPackageInfos(): Promise<IProjectPackageInfo[]> {
  const localRepositoryDir = globalSettingsProvider.getLocalRepositoryDir();
  if (!localRepositoryDir) {
    return [];
  }
  const packagesRoot = pathJoin(localRepositoryDir, 'firmware/projects_next');
  const packageNames = await fsxListFileBaseNames(packagesRoot, '.kmpkg.json');
  return await Promise.all(
    packageNames.map(async (packageName) => {
      const filePath = pathJoin(packagesRoot, packageName + '.kmpkg.json');
      return await fsxReadJsonFile(filePath);
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
