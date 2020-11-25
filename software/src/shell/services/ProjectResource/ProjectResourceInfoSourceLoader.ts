import { IProjectResourceOrigin } from '~defs/ProfileData';
import {
  fsExistsSync,
  fspReaddir,
  fsxReadJsonFile,
  globAsync,
  pathBasename,
  pathDirname,
  pathJoin,
  pathRelative,
  pathResolve
} from '~funcs/Files';
import { appEnv } from '~shell/base/AppEnvironment';

export interface IProjectResourceInfoSource {
  projectId: string;
  keyboardName: string;
  projectPath: string;
  projectFolderPath: string;
  layoutNames: string[];
  presetNames: string[];
  hexFilePath?: string;
}

interface IPorjectFileJson {
  projectId: string;
  keyboardName: string;
}
interface IProjectInfo {
  path: string;
  id: string;
  name: string;
  status: 'success' | 'failure';
  revision: number;
  updatedAt: string;
  hexFileSize: number;
  layoutNames: string[];
  presetNames: string[];
}

interface ISummaryJsonData {
  info: {
    buildStats: {
      numSuccess: number;
      numTotal: number;
    };
    environment: {
      OS: string;
      'avr-gcc': string;
      make: string;
    };
    updateAt: string;
    filesRevision: number;
  };
  projects: { [key in string]: IProjectInfo };
}

export namespace ProjectResourceInfoSourceLoader {
  function checkFileExistsOrBlank(filePath: string): string | undefined {
    return (fsExistsSync(filePath) && filePath) || undefined;
  }

  async function readPresetNames(presetsFolderPath: string): Promise<string[]> {
    if (fsExistsSync(presetsFolderPath)) {
      return (await fspReaddir(presetsFolderPath))
        .filter((fpath) => fpath.endsWith('.json'))
        .map((fpath) => pathBasename(fpath, '.json'));
    } else {
      return [];
    }
  }

  async function readLayoutNames(projectFolderPath: string): Promise<string[]> {
    return (await fspReaddir(projectFolderPath))
      .filter((fileName) => fileName.endsWith('layout.json'))
      .map((fileName) =>
        fileName === 'layout.json'
          ? 'default'
          : pathBasename(fileName, '.layout.json')
      );
  }

  async function readProjectFile(
    projectFilePath: string
  ): Promise<IPorjectFileJson> {
    return (await fsxReadJsonFile(projectFilePath)) as IPorjectFileJson;
  }

  // not tested yet
  async function loadCentralResourcesFromSummaryJson(): Promise<
    IProjectResourceInfoSource[]
  > {
    const variantsDir = appEnv.resolveUserDataFilePath('resources/variants');
    const summaryFilePath = appEnv.resolveUserDataFilePath(
      'resources/summary.json'
    );
    const summaryObj = (await fsxReadJsonFile(
      summaryFilePath
    )) as ISummaryJsonData;

    return Object.values(summaryObj.projects).map((info) => {
      const projectPath = info.path;
      const projectFolderPath = pathJoin(variantsDir, projectPath);
      const coreName = pathBasename(projectPath);
      const hexFilePath =
        (info.status === 'success' &&
          pathJoin(projectFolderPath, `${coreName}.hex`)) ||
        undefined;
      return {
        projectId: info.id,
        keyboardName: info.path, // todo: summary.jsonの生成時にkeyboardNameを追加してここで利用
        projectPath,
        projectFolderPath,
        layoutNames: info.layoutNames,
        presetNames: info.presetNames,
        hexFilePath
      };
    });
  }

  async function loadCentralResources(): Promise<IProjectResourceInfoSource[]> {
    const baseDir = appEnv.resolveUserDataFilePath('resources/variants');
    const pattern = `${baseDir}/**/*/metadata.json`;
    const metadataFilePaths = await globAsync(pattern);

    return await Promise.all(
      metadataFilePaths.map(async (metadataFilePath) => {
        const projectBaseDir = pathDirname(metadataFilePath);
        const coreName = pathBasename(projectBaseDir);

        const projectPath = projectBaseDir.replace(`${baseDir}/`, '');

        const projectFilePath = pathJoin(projectBaseDir, 'project.json');
        const hexFilePath = checkFileExistsOrBlank(
          pathJoin(projectBaseDir, `${coreName}.hex`)
        );
        const presetFolderPath = pathJoin(projectBaseDir, 'profiles');
        const presetNames = await readPresetNames(presetFolderPath);

        const { projectId, keyboardName } = await readProjectFile(
          projectFilePath
        );

        return {
          projectId,
          keyboardName,
          projectPath,
          projectFolderPath: projectBaseDir,
          layoutNames: [],
          presetNames,
          hexFilePath
        };
      })
    );
  }

  async function loadLocalResources(): Promise<IProjectResourceInfoSource[]> {
    const projectsRoot = pathResolve('../firmware/src/projects');
    const buildsRoot = pathResolve('../firmware/build');
    const projectFilePaths = await globAsync(
      `${projectsRoot}/**/*/project.json`
    );

    return await Promise.all(
      projectFilePaths.map(async (projectFilePath) => {
        const projectPath = pathRelative(
          projectsRoot,
          pathDirname(projectFilePath)
        );
        const projectBaseDir = pathDirname(projectFilePath);

        const coreName = pathBasename(projectPath);
        const hexFilePath = checkFileExistsOrBlank(
          pathJoin(buildsRoot, projectPath, `${coreName}.hex`)
        );

        const { projectId, keyboardName } = await readProjectFile(
          projectFilePath
        );

        const presetsFolderPath = pathJoin(projectBaseDir, 'profiles');

        const presetNames = await readPresetNames(presetsFolderPath);

        const layoutNames = await readLayoutNames(projectBaseDir);

        return {
          projectId,
          keyboardName,
          projectPath,
          projectFolderPath: projectBaseDir,
          layoutNames,
          presetNames,
          hexFilePath
        };
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
