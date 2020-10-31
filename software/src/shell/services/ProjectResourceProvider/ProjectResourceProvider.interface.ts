type IProjectOrigin = 'central' | 'extra' | 'local';

interface IProjectResourceInfo {
  resourceId: string; // ${origin}/${projectPath}
  projectId: string;
  projectName: string;
  projectPath: string;
  presetNames: string[];
  origin: IProjectOrigin;
}

interface IProjectResourceProvider {
  getAllProjectResourceInfos(): IProjectResourceInfo;
  getPresetFilePath(resourceId: string, presetName: string): string;
  getHexFilePath(resourceId: string): string;
  initialize(): Promise<void>;
}
