import {
  IPersistKeyboardDesign,
  IPresetSpec,
  IProfileData,
  IProjectResourceInfo,
} from '~/shared';

export interface IProjectResourceProviderImpl {
  loadAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;

  loadProjectPreset(
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined>;

  loadProjectLayout(
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined>;

  loadProjectFirmwareFile(projectId: string): Promise<string | undefined>;
}

// export interface IProjectResourceLoader__NEXT {
//   getAllProjectResourceInfos(): Promise<IProjectResourceInfo[]>;

//   loadProjectPresetFile(
//     origin: IProjectResourceOrigin,
//     projectId: string,
//     presetName: string,
//   ): Promise<string>;

//   loadProjectLayoutFile(
//     origin: IProjectResourceOrigin,
//     projectId: string,
//     layoutName: string,
//   ): Promise<string>;

//   loadProjectFirmwareFile(
//     origin: IProjectResourceOrigin,
//     projectId: string,
//   ): Promise<string>;
// }

export interface IProjectResourceProvider {
  getAllProjectResourceInfos(): IProjectResourceInfo[];

  // getLocalPresetProfileFilePath(
  //   projectId: string,
  //   presetName: string,
  // ): string | undefined;

  // getLocalLayoutFilePath(
  //   projectId: string,
  //   layoutName: string,
  // ): string | undefined;

  // getHexFilePath(projectId: string): string | undefined;

  loadProjectPreset(
    projectId: string,
    presetName: string,
  ): Promise<IProfileData | undefined>;

  loadProjectLayout(
    projectId: string,
    layoutName: string,
  ): Promise<IPersistKeyboardDesign | undefined>;

  // local: ローカルにあるプロジェクトのHexファイルのパスを返す
  // online: Hexファイルをリモートからダウンロードして一時ファイルに保存しファイルパスを返す
  loadProjectFirmwareFile(projectId: string): Promise<string | undefined>;

  initializeAsync(): Promise<void>;

  reenumerateResourceInfos(): Promise<void>;

  // internal_getProjectInfoSourceById(
  //   projectId: string,
  // ): IProjectResourceInfoSource | undefined;

  // patchLocalProjectInfoSource(
  //   projectId: string,
  //   callback: (info: IProjectResourceInfoSource) => void,
  // ): void;
}

export interface IPresetProfileLoadingFeature {
  loadPresetProfileData(
    projectId: string,
    presetSpec: IPresetSpec,
  ): Promise<IProfileData | undefined>;
}
