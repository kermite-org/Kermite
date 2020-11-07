import {
  IKeyboardShape,
  IProfileData,
  IProjectResourceInfo
} from '~defs/ProfileData';
import { IProjectResourceInfoSource } from '~shell/services/ProjectResource/ProjectResourceInfoSourceLoader';

export interface IProjectResourceInfoProvider {
  getAllProjectResourceInfos(): IProjectResourceInfo[];
  getPresetProfileFilePath(
    projectId: string,
    presetName: string
  ): string | undefined;
  getHexFilePath(projectId: string): string | undefined;
  getLayoutFilePath(projectId: string): string | undefined;
  initializeAsync(): Promise<void>;

  internal_getProjectInfoSourceById(
    projectId: string
  ): IProjectResourceInfoSource | undefined;
}

export interface IKeyboardShapeBulkLoader {
  loadKeyboardShapesWithCache(
    projectId: string[]
  ): Promise<{
    projectId: string;
    shape: IKeyboardShape;
  }>;
}

export interface IPresetProfileLoadingFeature {
  loadPresetProfileData(
    projectId: string,
    presetName: string | undefined
  ): Promise<IProfileData | undefined>;
}
