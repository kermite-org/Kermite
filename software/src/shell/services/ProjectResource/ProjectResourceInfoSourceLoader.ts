import {
  IKeyboardShapeDisplayArea,
  IKeyUnitEntry,
  IProjectResourceOrigin
} from '~defs/ProfileData';
import {
  fsIsFileExists,
  fsxReadJsonFile,
  globAsync,
  pathBaseName,
  pathDirName,
  pathJoin,
  pathRelative,
  pathResolve
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
  async function loadProjectInfoFromFiles(args: {
    projectPath: string;
    layoutFilePath: string;
    _hexFilePath: string;
    _presetsFolderPath: string;
  }) {
    const {
      projectPath,
      layoutFilePath,
      _hexFilePath,
      _presetsFolderPath
    } = args;

    const hexFilePath =
      (fsIsFileExists(_hexFilePath) && _hexFilePath) || undefined;
    const presetsFolderPath =
      (fsIsFileExists(_presetsFolderPath) && _presetsFolderPath) || undefined;

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
  }
  async function loadCentralResources(): Promise<IProjectResourceInfoSource[]> {
    const baseDir = appEnv.resolveUserDataFilePath('resources/variants');
    const pattern = `${baseDir}/**/*/metadata.json`;
    const metadataFilePaths = await globAsync(pattern);

    return await Promise.all(
      metadataFilePaths.map((metadataFilePath) => {
        const projectBaseDir = pathDirName(metadataFilePath);
        const coreName = pathBaseName(projectBaseDir);

        const projectPath = projectBaseDir.replace(`${baseDir}/`, '');

        const layoutFilePath = pathJoin(projectBaseDir, 'layout.json');
        const _hexFilePath = pathJoin(projectBaseDir, `${coreName}.hex`);
        const _presetsFolderPath = pathJoin(projectBaseDir, 'profiles');

        return loadProjectInfoFromFiles({
          projectPath,
          layoutFilePath,
          _hexFilePath,
          _presetsFolderPath
        });
      })
    );
  }

  async function loadLocalResources(): Promise<IProjectResourceInfoSource[]> {
    const projectsRoot = pathResolve('../firmware/src/projects');
    const buildsRoot = pathResolve('../firmware/build');
    const layoutFilePaths = await globAsync(`${projectsRoot}/**/*/layout.json`);

    return await Promise.all(
      layoutFilePaths.map((layoutFilePath) => {
        const projectPath = pathRelative(
          projectsRoot,
          pathDirName(layoutFilePath)
        );
        const coreName = pathBaseName(projectPath);
        const _hexFilePath = pathJoin(
          buildsRoot,
          projectPath,
          `${coreName}.hex`
        );
        const _presetsFolderPath = pathJoin(
          projectsRoot,
          projectPath,
          'profiles'
        );

        return loadProjectInfoFromFiles({
          projectPath,
          layoutFilePath,
          _hexFilePath,
          _presetsFolderPath
        });
      })
    );
  }

  export async function loadProjectResourceInfoSources(
    resourceOrigin: IProjectResourceOrigin
  ): Promise<IProjectResourceInfoSource[]> {
    if (resourceOrigin === 'central') {
      return await loadCentralResources();
    } else {
      return await loadLocalResources();
    }
  }
}
