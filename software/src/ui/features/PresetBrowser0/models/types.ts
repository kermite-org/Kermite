import { IProfileData } from '~/shared';
import { ISelectorSource } from '~/ui/base';

export interface IPresetSelectionModel {
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
  currentProjectKey: string;
  currentPresetKey: string;
  selectProject(projectKey: string): void;
  loadedProfileData: IProfileData;
  editSelectedProjectPreset(): void;
}
