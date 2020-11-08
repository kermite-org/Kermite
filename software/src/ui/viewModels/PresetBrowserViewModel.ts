import { IProjectResourceInfo } from '~defs/ProfileData';
import { Models } from '~ui/models';
import { ISelectorSource } from '~ui/viewModels/viewModelInterfaces';
import {
  IPresetKeyboardViewModel,
  PresetKeyboardViewModel
} from './PresetKeyboardViewModel';

export interface IPresetBrowserViewModel {
  keyboard: IPresetKeyboardViewModel;
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;

  isLinkButtonActive: boolean;
  linkButtonHandler(): void;
}

export class PresetBrowserViewModel implements IPresetBrowserViewModel {
  keyboard = new PresetKeyboardViewModel();

  constructor(private models: Models) {}

  private resourceInfos: IProjectResourceInfo[] = [];

  private selectedProjectId: string = '';

  private selectedPresetName: string = 'blank';

  private async loadSelectedProfile() {
    const loadedProfileData = await this.models.backend.loadPresetProfile(
      this.selectedProjectId,
      this.selectedPresetName === 'blank' ? undefined : this.selectedPresetName
    );
    if (loadedProfileData) {
      this.keyboard.setProfileData(loadedProfileData);
    } else {
      console.error(`errro while loading preset profile`);
    }
  }

  get projectSelectorSource() {
    return {
      options: this.resourceInfos.map((info) => ({
        id: info.projectId,
        text: info.projectName
      })),
      choiceId: this.selectedProjectId,
      setChoiceId: (id: string) => {
        this.selectedProjectId = id;
        this.selectedPresetName = 'blank';
        this.loadSelectedProfile();
      }
    };
  }

  get presetSelectorSource() {
    const info = this.resourceInfos.find(
      (info) => info.projectId === this.selectedProjectId
    );
    const presetNames = info?.presetNames
      ? ['blank', ...info.presetNames]
      : ['blank'];
    return {
      options: presetNames.map((it) => ({ id: it, text: it })),
      choiceId: this.selectedPresetName,
      setChoiceId: (id: string) => {
        this.selectedPresetName = id;
        this.loadSelectedProfile();
      }
    };
  }

  get isLinkButtonActive() {
    return (
      this.models.deviceStatusModel.isConnected &&
      this.models.deviceStatusModel.deviceAttrs?.projectId !==
        this.selectedProjectId
    );
  }

  linkButtonHandler = () => {
    const deviceProjectId =
      this.models.deviceStatusModel.deviceAttrs?.projectId || '';
    this.projectSelectorSource.setChoiceId(deviceProjectId);
  };

  private onResourceModelLoaded = () => {
    this.resourceInfos = this.models.projectResourceModel.projectResourceInfos;
    if (this.resourceInfos.length > 0) {
      this.selectedProjectId = this.resourceInfos[0].projectId;
      this.selectedPresetName = 'blank';
      this.loadSelectedProfile();
    }
  };

  initialize() {
    this.models.projectResourceModel.loadedNotifier.listen(
      this.onResourceModelLoaded
    );
  }
}
