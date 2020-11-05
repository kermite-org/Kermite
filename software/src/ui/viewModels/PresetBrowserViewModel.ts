import { IProjectResourceInfo } from '~defs/ProfileData';
import { appUi } from '~ui/core';
import { Models } from '~ui/models';
import {
  IPresetKeyboardViewModel,
  PresetKeyboardViewModel
} from './PresetKeyboardViewModel';

export interface ISelectorSource {
  options: {
    id: string;
    text: string;
  }[];
  choiceId: string;
  setChoiceId(id: string): void;
}

export interface IPresetBrowserViewModel {
  keyboard: IPresetKeyboardViewModel;
  projectSelectorSource: ISelectorSource;
  presetSelectorSource: ISelectorSource;
}

export class PresetBrowserViewModel implements IPresetBrowserViewModel {
  keyboard = new PresetKeyboardViewModel();

  constructor(private models: Models) {}

  private resourceInfos: IProjectResourceInfo[] = [];

  private selectedProjectId: string = '';

  private selectedPresetName: string = 'blank';

  get projectSelectorSource() {
    const projectOptions = this.resourceInfos.map((info) => ({
      id: info.projectId,
      text: info.projectName
    }));
    return {
      options: projectOptions,
      choiceId: this.selectedProjectId,
      setChoiceId: (id: string) => {
        this.selectedProjectId = id;
        this.selectedPresetName = 'blank';
        this.loadSelectedProfile();
      }
    };
  }

  async loadSelectedProfile() {
    const loadedProfileData = await this.models.backend.loadPresetProfile(
      this.selectedProjectId,
      this.selectedPresetName === 'blank' ? undefined : this.selectedPresetName
    );
    if (loadedProfileData) {
      this.keyboard.setProfileData(loadedProfileData);
    } else {
      console.error(`errro while loading preset profile`);
    }
    appUi.rerender();
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

  private onResourceModelLoaded = () => {
    this.resourceInfos = this.models.projectResourceModel.projectResourceInfos;
    if (this.resourceInfos.length > 0) {
      this.selectedProjectId = this.resourceInfos[0].projectId;
      this.selectedPresetName = 'blank';
      this.loadSelectedProfile();
    }
    this.models.projectResourceModel.loadedEvents.unsubscribe(
      this.onResourceModelLoaded
    );
  };

  initialize() {
    this.models.projectResourceModel.loadedEvents.subscribe(
      this.onResourceModelLoaded
    );
  }
}
