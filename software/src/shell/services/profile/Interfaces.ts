import { IProfileData, IProfileManagerCommand } from '~/shared';

export interface IProfileManager {
  getCurrentProfileProjectId(): string;
  getCurrentProfile(): IProfileData | undefined;
  executeCommands(commands: IProfileManagerCommand[]): Promise<void>;
  saveCurrentProfile(profileData: IProfileData): Promise<void>;
}

// export interface IPresetProfileLoader {
//   loadPresetProfileData(
//     origin: IResourceOrigin,
//     projectId: string,
//     presetSpec: IPresetSpec,
//   ): Promise<IProfileData | undefined>;
//   // deleteProjectPresetProfileCache(projectId: string): void;
// }
