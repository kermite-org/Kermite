import { IProjectPackageInfo } from '~/shared';
import { fsxListFileBaseNames, fsxReadJsonFile, pathJoin } from '~/shell/funcs';
import { globalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';

interface IProjectPackageProvider {
  getAllProjectResourceInfos(): Promise<IProjectPackageInfo[]>;
}

async function loadLocalProjectResourceInfos(): Promise<IProjectPackageInfo[]> {
  const localRepositoryDir = globalSettingsProvider.getLocalRepositoryDir();
  if (!localRepositoryDir) {
    return [];
  }

  const packagesRoot = pathJoin(localRepositoryDir, 'firmware/projects_next');
  const packageNames = await fsxListFileBaseNames(packagesRoot, '.kmpkg.json');
  console.log({ packageNames });
  return await Promise.all(
    packageNames.map(async (packageName) => {
      const filePath = pathJoin(packagesRoot, packageName + '.kmpkg.json');
      return await fsxReadJsonFile(filePath);
    }),
  );
}

export class ProjectPackageProvider implements IProjectPackageProvider {
  private cached: IProjectPackageInfo[] | undefined;

  async getAllProjectResourceInfos(): Promise<IProjectPackageInfo[]> {
    if (!this.cached) {
      this.cached = await loadLocalProjectResourceInfos();
    }
    return this.cached;
  }
}

export const projectPackageProvider = new ProjectPackageProvider();
