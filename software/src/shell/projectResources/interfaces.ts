import {
  IFirmwareTargetDevice,
  IPersistKeyboardDesign,
  IProfileData,
  IProjectCustomDefinition,
  IProjectResourceInfo,
  IResourceOrigin,
} from '~/shared';

export interface IFirmwareBinaryFileSpec {
  filePath: string;
  targetDevice: IFirmwareTargetDevice;
}
export interface IProjectResourceProviderImpl {
  getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;

  getProjectCustomDefinition(
    projectId: string,
  ): Promise<IProjectCustomDefinition | undefined>;

  loadProjectPreset(
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined>;

  loadProjectLayout(
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined>;

  loadProjectFirmwareFile(
    projectId: string,
    variationName: string,
  ): Promise<IFirmwareBinaryFileSpec | undefined>;
}

export interface IProjectResourceProvider {
  getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;

  loadProjectPreset(
    origin: IResourceOrigin,
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined>;

  loadProjectLayout(
    origin: IResourceOrigin,
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined>;

  // local: ローカルにあるプロジェクトのHexファイルのパスを返す
  // online: Hexファイルをリモートからダウンロードして一時ファイルに保存しファイルパスを返す
  loadProjectFirmwareFile(
    origin: IResourceOrigin,
    projectId: string,
    variationName: string,
  ): Promise<IFirmwareBinaryFileSpec | undefined>;
}
