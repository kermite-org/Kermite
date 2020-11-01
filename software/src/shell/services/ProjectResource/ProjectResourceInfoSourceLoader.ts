import { IKeyboardShapeDisplayArea, IKeyUnitEntry } from '~defs/ProfileData';
import {
  fsIsFileExists,
  fsxReadJsonFile,
  globAsync,
  pathBaseName,
  pathDirName,
  pathJoin
} from '~funcs/Files';
import { appEnv } from '~shell/base/AppEnvironment';

export interface IProjectResourceInfoSource {
  projectId: string;
  projectName: string;
  projectPath: string;
  presetNames: string[];
  presetsFolderPath?: string;
  hexFilePath?: string;
  layoutFilePath?: string;
}

interface ILayoutFileJson {
  projectId: string;
  projectName: string;
  keyUnits: IKeyUnitEntry[];
  displayArea: IKeyboardShapeDisplayArea;
  bodyPathMarkups: string[];
}

export namespace ProjectResourceInfoSourceLoader {
  async function loadMainResources(): Promise<IProjectResourceInfoSource[]> {
    const baseDir = appEnv.resolveUserDataFilePath('resources/variants');
    const pattern = `${baseDir}/**/*/metadata.json`;
    const metadataFilePaths = await globAsync(pattern);

    return await Promise.all(
      metadataFilePaths.map(async (metadataFilePath) => {
        const projectBaseDir = pathDirName(metadataFilePath);
        const coreName = pathBaseName(projectBaseDir);

        const projectPath = projectBaseDir.replace(`${baseDir}/`, '');

        const layoutFilePath = pathJoin(projectBaseDir, 'layout.json');
        const _hexFilePath = pathJoin(projectBaseDir, `${coreName}.hex`);
        const _presetsFolderPath = pathJoin(projectBaseDir, 'profiles');

        const hexFilePath =
          (fsIsFileExists(_hexFilePath) && _hexFilePath) || undefined;
        const presetsFolderPath =
          (fsIsFileExists(_presetsFolderPath) && _presetsFolderPath) ||
          undefined;

        const layoutContent = (await fsxReadJsonFile(
          layoutFilePath
        )) as ILayoutFileJson;

        const { projectId, projectName } = layoutContent;

        let presetNames: string[] = [];
        if (presetsFolderPath) {
          const pattern = `${presetsFolderPath}/*.json`;
          const presetFilePaths = await globAsync(pattern);
          presetNames = presetFilePaths.map((fpath) =>
            pathBaseName(fpath).replace('.json', '')
          );
        }

        return {
          projectId,
          projectName,
          projectPath,
          presetNames,
          presetsFolderPath,
          hexFilePath,
          layoutFilePath
        };
      })
    );
  }

  async function loadLocalResources(): Promise<IProjectResourceInfoSource[]> {
    // read local resources from
    // pathResolve('../firmware/src/projects');
    // pathResolve('../firmware/build');
    return [];
  }

  export async function loadProjectResourceInfoSources(): Promise<
    IProjectResourceInfoSource[]
  > {
    if (appEnv.isDevelopment) {
      return await loadMainResources();
      // return await loadLocalResources();
    } else {
      return await loadMainResources();
    }
  }
}
