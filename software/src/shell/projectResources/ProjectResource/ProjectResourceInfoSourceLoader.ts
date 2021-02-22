import { IResourceOrigin } from '~/shared';
import { appEnv } from '~/shell/base';
import {
  fsExistsSync,
  pathBasename,
  fsxReadJsonFile,
  pathJoin,
  globAsync,
  pathDirname,
  pathResolve,
  pathRelative,
  fsxReaddir,
} from '~/shell/funcs';

export interface IProjectResourceInfoSource {
  projectId: string;
  keyboardName: string;
  projectPath: string;
  projectFolderPath: string;
  layoutNames: string[];
  presetNames: string[];
  hexFilePath?: string;
  origin: IResourceOrigin;
}

interface IPorjectFileJson {
  projectId: string;
  keyboardName: string;
}
interface IProjectInfo {
  projectPath: string;
  projectId: string;
  keyboardName: string;
  buildStatus: 'success' | 'failure';
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
  projects: IProjectInfo[];
}

namespace ProjectResourceInfoSourceLoader__DEPRECATED {
  function checkFileExistsOrBlank(filePath: string): string | undefined {
    return (fsExistsSync(filePath) && filePath) || undefined;
  }

  async function readPresetNames(presetsFolderPath: string): Promise<string[]> {
    if (fsExistsSync(presetsFolderPath)) {
      return (await fsxReaddir(presetsFolderPath))
        .filter((fpath) => fpath.endsWith('.json'))
        .map((fpath) => pathBasename(fpath, '.json'));
    } else {
      return [];
    }
  }

  async function readLayoutNames(projectFolderPath: string): Promise<string[]> {
    return (await fsxReaddir(projectFolderPath))
      .filter((fileName) => fileName.endsWith('.layout.json'))
      .map((fileName) => pathBasename(fileName, '.layout.json'));
  }

  async function readProjectFile(
    projectFilePath: string,
  ): Promise<IPorjectFileJson> {
    return (await fsxReadJsonFile(projectFilePath)) as IPorjectFileJson;
  }

  async function loadCentralResourcesFromSummaryJson(): Promise<
    IProjectResourceInfoSource[]
  > {
    const variantsDir = appEnv.resolveUserDataFilePath('resources/variants');
    const summaryFilePath = appEnv.resolveUserDataFilePath(
      'resources/summary.json',
    );
    const summaryObj = (await fsxReadJsonFile(
      summaryFilePath,
    )) as ISummaryJsonData;

    return summaryObj.projects.map((info) => {
      const {
        projectId,
        keyboardName,
        projectPath,
        layoutNames,
        presetNames,
      } = info;
      const projectFolderPath = pathJoin(variantsDir, projectPath);
      const coreName = pathBasename(projectPath);
      const hexFilePath =
        (info.buildStatus === 'success' &&
          pathJoin(projectFolderPath, `${coreName}.hex`)) ||
        undefined;
      return {
        projectId,
        keyboardName,
        projectPath,
        projectFolderPath,
        layoutNames,
        presetNames,
        hexFilePath,
        origin: 'online',
      };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function loadCentralResourcesFromResourceFiles_deprecated(): Promise<
    IProjectResourceInfoSource[]
  > {
    const baseDir = appEnv.resolveUserDataFilePath('resources/variants');
    const pattern = `${baseDir}/**/*/metadata.json`;
    const metadataFilePaths = await globAsync(pattern);

    return await Promise.all(
      metadataFilePaths.map(async (metadataFilePath) => {
        const projectBaseDir = pathDirname(metadataFilePath);
        const coreName = pathBasename(projectBaseDir);

        const projectPath = projectBaseDir.replace(`${baseDir}/`, '');

        const projectFilePath = pathJoin(projectBaseDir, 'project.json');

        const { projectId, keyboardName } = await readProjectFile(
          projectFilePath,
        );

        const hexFilePath = checkFileExistsOrBlank(
          pathJoin(projectBaseDir, `${coreName}.hex`),
        );
        const presetFolderPath = pathJoin(projectBaseDir, 'profiles');
        const presetNames = await readPresetNames(presetFolderPath);

        const layoutNames = await readLayoutNames(projectBaseDir);

        return {
          projectId,
          keyboardName,
          projectPath,
          projectFolderPath: projectBaseDir,
          layoutNames,
          presetNames,
          hexFilePath,
          origin: 'local' as const,
        };
      }),
    );
  }

  async function loadLocalResources(): Promise<IProjectResourceInfoSource[]> {
    const projectsRoot = pathResolve('../firmware/src/projects');
    const buildsRoot = pathResolve('../firmware/build');
    const projectFilePaths = await globAsync(
      `${projectsRoot}/**/*/project.json`,
    );

    return await Promise.all(
      projectFilePaths.map(async (projectFilePath) => {
        const projectPath = pathRelative(
          projectsRoot,
          pathDirname(projectFilePath),
        );
        const projectBaseDir = pathDirname(projectFilePath);

        const coreName = pathBasename(projectPath);
        const hexFilePath = checkFileExistsOrBlank(
          pathJoin(buildsRoot, projectPath, `${coreName}.hex`),
        );

        const { projectId, keyboardName } = await readProjectFile(
          projectFilePath,
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
          hexFilePath,
          origin: 'local' as const,
        };
      }),
    );
  }

  export async function loadProjectResourceInfoSources(
    resourceOrigin: IResourceOrigin,
  ): Promise<IProjectResourceInfoSource[]> {
    if (resourceOrigin === 'online') {
      return await loadCentralResourcesFromSummaryJson();
    } else {
      return await loadLocalResources();
    }
  }
}
