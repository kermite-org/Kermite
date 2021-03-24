import {
  IFirmwareTargetDevice,
  IPersistKeyboardDesign,
  IProfileData,
  IProjectCustomDefinition,
  IProjectResourceInfo,
} from '~/shared';
import { createProjectSig } from '~/shared/funcs/DomainRelatedHelpers';
import { appEnv } from '~/shell/base';
import {
  cacheRemoteResouce,
  fetchJson,
  fetchText,
  fsxMkdirpSync,
  fsxWriteFile,
  pathDirname,
} from '~/shell/funcs';
import { LayoutFileLoader } from '~/shell/loaders/LayoutFileLoader';
import { ProfileFileLoader } from '~/shell/loaders/ProfileFileLoader';
import {
  IFirmwareBinaryFileSpec,
  IProjectResourceProviderImpl,
} from '~/shell/projectResources';
import { IPorjectFileJson } from '~/shell/projectResources/ProjectResourceProviderImpl_Local';
import { GlobalSettingsProvider } from '~/shell/services/config/GlobalSettingsProvider';

const remoteBaseUri =
  'https://raw.githubusercontent.com/yahiro07/KermiteResourceStore/master/resources';

interface IRemoteProjectResourceInfoSource {
  projectId: string;
  projectPath: string;
  keyboardName: string;
  layoutNames: string[];
  presetNames: string[];
  firmwares: {
    variationName: string;
    targetDevice: IFirmwareTargetDevice;
    binaryFileName: string;
    buildRevision: number;
    buildTimestamp: string;
    romUsage: number;
    ramUsage: number;
  }[];
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
  projects: IRemoteProjectResourceInfoSource[];
}

async function loadRemoteResourceInfosFromSummaryJson(): Promise<
  IRemoteProjectResourceInfoSource[]
> {
  const remoteSummary = await cacheRemoteResouce<ISummaryJsonData>(
    fetchJson,
    `${remoteBaseUri}/summary.json`,
  );
  return remoteSummary.projects;
}

export class ProjectResourceProviderImpl_Remote
  implements IProjectResourceProviderImpl {
  private projectInfoSources: IRemoteProjectResourceInfoSource[] = [];

  private loaded = false;
  async getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]> {
    const globalSetttings = GlobalSettingsProvider.getGlobalSettings();
    if (!globalSetttings.useOnlineResources) {
      return [];
    }
    if (!this.loaded) {
      this.projectInfoSources = await loadRemoteResourceInfosFromSummaryJson();
      this.loaded = true;
    }
    return this.projectInfoSources.map((it) => ({
      sig: createProjectSig('online', it.projectId),
      origin: 'online',
      projectId: it.projectId,
      keyboardName: it.keyboardName,
      projectPath: it.projectPath,
      presetNames: it.presetNames,
      layoutNames: it.layoutNames,
      firmwares: it.firmwares.map((f) => ({
        variationName: f.variationName,
        targetDevice: f.targetDevice,
        buildRevision: f.buildRevision,
        buildTimestamp: f.buildTimestamp,
      })),
    }));
  }

  private getProjectInfoSourceById(
    projectId: string,
  ): IRemoteProjectResourceInfoSource | undefined {
    return this.projectInfoSources.find((info) => info.projectId === projectId);
  }

  async getProjectCustomDefinition(
    projectId: string,
  ): Promise<IProjectCustomDefinition | undefined> {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      const relPath = `variants/${info.projectPath}/project.json`;
      const uri = `${remoteBaseUri}/${relPath}`;
      const projectJsonContent = await cacheRemoteResouce<IPorjectFileJson>(
        fetchJson,
        uri,
      );
      return {
        customParameterSpecs: projectJsonContent.customParameters,
      };
    }
  }

  async loadProjectPreset(
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined> {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      const relPath = `variants/${info.projectPath}/profiles/${presetName}.profile.json`;
      const uri = `${remoteBaseUri}/${relPath}`;
      return await ProfileFileLoader.loadProfileFromUri(uri);
    }
  }

  async loadProjectLayout(
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined> {
    const info = this.getProjectInfoSourceById(projectId);
    if (info) {
      const relPath = `variants/${info.projectPath}/${layoutName}.layout.json`;
      const uri = `${remoteBaseUri}/${relPath}`;
      return await LayoutFileLoader.loadLayoutFromUri(uri);
    }
  }

  async loadProjectFirmwareFile(
    projectId: string,
    variationName: string,
  ): Promise<IFirmwareBinaryFileSpec | undefined> {
    // リモートからファイルを取得後、ローカルに一時ファイルとして保存してファイルパスを返す
    const info = this.getProjectInfoSourceById(projectId);
    const firm = info?.firmwares.find((f) => f.variationName === variationName);
    if (info && firm) {
      const { binaryFileName } = firm;
      const relPath = `variants/${info.projectPath}/${binaryFileName}`;
      const uri = `${remoteBaseUri}/${relPath}`;
      const binaryFileContent = await cacheRemoteResouce(fetchText, uri);
      const localFilePath = appEnv.resolveTempFilePath(
        `remote_resources/${relPath}`,
      );
      fsxMkdirpSync(pathDirname(localFilePath));
      await fsxWriteFile(localFilePath, binaryFileContent);
      return {
        filePath: localFilePath,
        targetDevice: firm?.targetDevice,
      };
    }
  }
}
