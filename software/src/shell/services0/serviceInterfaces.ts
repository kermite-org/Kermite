import { IProjectResourceInfo, IKeyboardShape, IProfileData } from '@shared';
import { IProjectResourceInfoSource } from '@shell/services0/ProjectResource/ProjectResourceInfoSourceLoader';

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
}

export interface IKeyboardShapeBulkLoader {
  loadKeyboardShapesWithCache(
    projectId: string[],
  ): Promise<{
    projectId: string;
    shape: IKeyboardShape;
  }>;
}

export interface IPresetProfileLoadingFeature {
  loadPresetProfileData(
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined>;
}
