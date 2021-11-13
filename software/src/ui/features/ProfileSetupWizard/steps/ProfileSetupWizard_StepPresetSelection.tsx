import { css, FC, jsx, useMemo } from 'alumina';
import {
  createPresetKey,
  fallbackProfileData,
  getPresetSpecFromPresetKey,
  IProfileData,
  IProjectPackageInfo,
  ProfileDataConverter,
} from '~/shared';
import { colors, ISelectorOption, ISelectorSource, texts } from '~/ui/base';
import { KeyboardProfileSelector } from '~/ui/components';
import { PresetKeyboardSection } from '~/ui/fabrics';
import { profileSetupStore } from '~/ui/features/ProfileSetupWizard/store/ProfileSetupStore';

function makePresetOptions(
  projectInfo: IProjectPackageInfo,
): ISelectorOption[] {
  return [
    ...projectInfo.layouts.map(({ layoutName }) => ({
      value: createPresetKey('blank', layoutName),
      label: `(layout)${layoutName}`,
    })),
    ...projectInfo.profiles.map(({ profileName }) => ({
      value: createPresetKey('preset', profileName),
      label: `(profile)${profileName}`,
    })),
  ];
}

export function useProfileDataLoaded(
  projectInfo: IProjectPackageInfo,
  presetKey: string,
): IProfileData {
  return useMemo(() => {
    if (presetKey) {
      const presetSpec = getPresetSpecFromPresetKey(presetKey);
      if (presetSpec.type === 'preset') {
        const profile = projectInfo.profiles.find(
          (profile) => profile.profileName === presetSpec.presetName,
        );
        if (profile) {
          return ProfileDataConverter.convertProfileDataFromPersist(
            profile.data,
          );
        }
      } else {
        const layout = projectInfo.layouts.find(
          (layout) => layout.layoutName === presetSpec.layoutName,
        );
        if (layout) {
          return { ...fallbackProfileData, keyboardDesign: layout.data };
        }
      }
    }
    return fallbackProfileData;
  }, [projectInfo, presetKey]);
}

type PresetSelectionStepModel = {
  presetSelectorSource: ISelectorSource;
  loadedProfileData: IProfileData;
};

function usePresetSelectionStepModel(): PresetSelectionStepModel {
  const { presetKey } = profileSetupStore.state;
  const { targetProjectInfo } = profileSetupStore.readers;
  const { setPresetKey } = profileSetupStore.actions;

  const presetSelectorSource = {
    options: makePresetOptions(targetProjectInfo),
    value: presetKey,
    setValue: setPresetKey,
  };
  const loadedProfileData = useProfileDataLoaded(targetProjectInfo, presetKey);

  return { presetSelectorSource, loadedProfileData };
}

export const ProfileSetupWizard_StepPresetSelection: FC = () => {
  const { presetSelectorSource, loadedProfileData } =
    usePresetSelectionStepModel();
  return (
    <div css={style}>
      <div class="selectors-part">
        <div>{texts.label_presetBrowser_selectionTitle_preset}</div>
        <KeyboardProfileSelector
          selectorSource={presetSelectorSource}
          hint={texts.hint_presetBrowser_selection_preset}
        />
      </div>
      <div class="keyboard-part">
        <PresetKeyboardSection profileData={loadedProfileData} />
      </div>
    </div>
  );
};

const style = css`
  height: 100%;
  background-color: ${colors.clPanelBox};
  padding: 20px;
  overflow-y: auto;

  > .selectors-part {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  > .keyboard-part {
    margin-top: 15px;
  }
`;
