import {
  IKeyboardShape,
  IProfileData,
  IProjectResourceInfo
} from '~defs/ProfileData';

export interface IProjectResourceInfoProvider {
  getAllProjectResourceInfos(): IProjectResourceInfo[];
  getPresetProfileFilePath(
    projectId: string,
    presetName: string
  ): string | undefined;
  getHexFilePath(projectId: string): string | undefined;
  getLayoutFilePath(projectId: string): string | undefined;
  initialize(): Promise<void>;
}

export interface IKeyboardShapeBulkLoader {
  loadKeyboardShapesWithCache(
    projectId: string[]
  ): Promise<{
    projectId: string;
    shape: IKeyboardShape;
  }>;
}

export interface IProjectManagerPresetLoadingFeature {
  loadPresetProfileData(
    projectId: string,
    presetName: string
  ): Promise<IProfileData>;
}
