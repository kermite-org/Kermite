import {
  IPersistKeyboardDesign,
  IPresetSpec,
  IProfileData,
  IProjectResourceInfo,
  IProjectResourceOrigin,
} from '~/shared';
import { IProjectResourceInfoSource } from '~/shell/projects/ProjectResource/ProjectResourceInfoSourceLoader';

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
