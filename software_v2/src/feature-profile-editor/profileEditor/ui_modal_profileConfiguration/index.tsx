import { FC, css, jsx } from 'alumina';
import { reflectChecked, texts } from '~/app-shared';
import { ClosableOverlay, CommonDialogFrame } from '~/fe-shared';
import { profileEditorConfig } from '../adapters';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';
import {
  DualModeSettingsPart,
  DualModeSettingsPart2,
} from './DualModeSettingsPart';
import { ShiftCancelOptionPart } from './ShiftCancelOptionPart';
// import { commitUiSettings, uiReaders, uiState } from '~/ui/store';

const AdvancedOptionSwitchPart: FC = () => (
  <div class={cssAdvancedOptionSwitchPart}>
    <input
      type="checkbox"
      checked={profileEditorConfig.settings.showProfileAdvancedOptions}
      onChange={reflectChecked((checked) =>
        profileEditorConfig.commitUiSettings({
          showProfileAdvancedOptions: checked,
        }),
      )}
    />
    <label>advanced options</label>
  </div>
);

const cssAdvancedOptionSwitchPart = css`
  display: flex;
  align-items: center;
  > input {
    margin-right: 5px;
    cursor: pointer;
  }
`;

export const ProfileConfigurationModalLayer: FC = () => {
  const visible = profileEditorConfig.uiState.profileConfigModalVisible;
  const closeModal = () => {
    profileEditorConfig.uiState.profileConfigModalVisible = false;
  };

  if (!visible) {
    return null;
  }

  const showAdvancedOptions =
    profileEditorConfig.settings.showProfileAdvancedOptions;

  // const showProjectSelectionUi =
  //   showAdvancedOptions &&
  //   profileEditorConfig.isDeveloperMode &&
  //   !uiReaders.globalSettings.globalProjectSpec;

  return (
    <ClosableOverlay close={closeModal}>
      <CommonDialogFrame
        caption={texts.assignerProfileConfigModal.modalTitle}
        close={closeModal}
      >
        <div class={cssDialogContent}>
          {/* <KeyboardProjectSelectionPart if={showProjectSelectionUi} /> */}
          <AssignTypeSelectionPart />
          <DualModeSettingsPart />
          <AdvancedOptionSwitchPart />
          <DualModeSettingsPart2 if={showAdvancedOptions} />
          <ShiftCancelOptionPart if={showAdvancedOptions} />
        </div>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};

const cssDialogContent = css`
  margin: 10px;
  color: black;
  min-height: 140px;

  > * + * {
    margin-top: 10px;
  }
`;
