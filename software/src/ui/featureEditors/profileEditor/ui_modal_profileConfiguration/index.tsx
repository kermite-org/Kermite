import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { ClosableOverlay, CommonDialogFrame } from '~/ui/components';
import {
  DualModeSettingsPart,
  DualModeSettingsPart2,
} from '~/ui/featureEditors/profileEditor/ui_modal_profileConfiguration/DualModeSettingsPart';
import { KeyboardProjectSelectionPart } from '~/ui/featureEditors/profileEditor/ui_modal_profileConfiguration/KeyboardProjectSelectionPart';
import { ShiftCancelOptionPart } from '~/ui/featureEditors/profileEditor/ui_modal_profileConfiguration/ShiftCancelOptionPart';
import { commitUiSettings, uiReaders, uiState } from '~/ui/store';
import { reflectChecked } from '~/ui/utils';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';

const AdvancedOptionSwitchPart: FC = () => (
  <div class={cssAdvancedOptionSwitchPart}>
    <input
      type="checkbox"
      checked={uiState.settings.showProfileAdvancedOptions}
      onChange={reflectChecked((checked) =>
        commitUiSettings({ showProfileAdvancedOptions: checked }),
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
  const visible = uiState.profileConfigModalVisible;
  const closeModal = () => {
    uiState.profileConfigModalVisible = false;
  };

  if (!visible) {
    return null;
  }

  const showAdvancedOptions = uiState.settings.showProfileAdvancedOptions;

  const showProjectSelectionUi =
    showAdvancedOptions &&
    uiReaders.isDeveloperMode &&
    !uiReaders.globalSettings.globalProjectSpec;

  return (
    <ClosableOverlay close={closeModal}>
      <CommonDialogFrame
        caption={texts.assignerProfileConfigModal.modalTitle}
        close={closeModal}
      >
        <div class={cssDialogContent}>
          <KeyboardProjectSelectionPart if={showProjectSelectionUi} />
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
