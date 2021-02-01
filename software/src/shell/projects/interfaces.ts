import {
  IPersistKeyboardDesign,
  IPresetSpec,
  IProfileData,
  IProjectResourceInfo,
  IProjectResourceOrigin,
} from '~/shared';
import { IProjectResourceInfoSource } from '~/shell/projects/ProjectResource/ProjectResourceInfoSourceLoader';

export interface IProjectResourceLoaderCore__NEXT {
  getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;
  loadProjectPresetFile(projectId: string, presetName: string): Promise<string>;
  loadProjectLayoutFile(projectId: string, layoutName: string): Promise<string>;
  loadProjectFirmwareFile(projectId: string): Promise<string>;
}

export interface IProjectResourceLoader__NEXT {
  getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;

  loadProjectPresetFile(
    origin: IProjectResourceOrigin,
    projectId: string,
    presetName: string,
  ): Promise<string>;

  loadProjectLayoutFile(
    origin: IProjectResourceOrigin,
    projectId: string,
    layoutName: string,
  ): Promise<string>;

  loadProjectFirmwareFile(
    origin: IProjectResourceOrigin,
    projectId: string,
  ): Promise<string>;
}

export interface IProjectResourceInfoProvider {
  getAllProjectResourceInfos(): IProjectResourceInfo[];
  getPresetProfileFilePath(
    projectId: string,
    presetName: string,
  ): string | undefined;
  getHexFilePath(projectId: string): string | undefined;
  getLayoutFilePath(projectId: string, layoutName: string): string | undefined;
  initializeAsync(): Promise<void>;

  internal_getProjectInfoSourceById(
    projectId: string,
  ): IProjectResourceInfoSource | undefined;

  patchProjectInfoSource(
    projectId: string,
    callback: (info: IProjectResourceInfoSource) => void,
  ): void;
}

export interface IKeyboardShapeBulkLoader {
  loadKeyboardShapesWithCache(
    projectId: string[],
  ): Promise<{
    projectId: string;
    design: IPersistKeyboardDesign;
  }>;
}

export interface IPresetProfileLoadingFeature {
  loadPresetProfileData(
    projectId: string,
    presetSpec: IPresetSpec,
  ): Promise<IProfileData | undefined>;
}
