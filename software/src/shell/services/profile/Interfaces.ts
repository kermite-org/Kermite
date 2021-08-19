import { IProfileData } from '~/shared';

export interface IProfileManager {
  getCurrentProfileProjectId(): string;
  getCurrentProfile(): IProfileData | undefined;
}

// export interface IPresetProfileLoader {
//   loadPresetProfileData(
//     origin: IResourceOrigin,
//     projectId: string,
//     presetSpec: IPresetSpec,
//   ): Promise<IProfileData | undefined>;
//   // deleteProjectPresetProfileCache(projectId: string): void;
// }
