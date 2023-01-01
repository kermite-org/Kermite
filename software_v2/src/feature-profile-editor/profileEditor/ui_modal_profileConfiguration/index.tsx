import { FC, css, jsx } from 'alumina';
import { reflectChecked, texts } from '~/app-shared';
import { ClosableOverlay, CommonDialogFrame } from '~/fe-shared';
import { profileEditorStore } from '../../store';
import { profileEditorConfig } from '../adapters';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';
import {
  DualModeSettingsPart,
  DualModeSettingsPart2,
} from './DualModeSettingsPart';
import { ShiftCancelOptionPart } from './ShiftCancelOptionPart';

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
  const visible = profileEditorStore.readers.configurationPanelVisible;
  const closeModal = () => {
    profileEditorStore.actions.closeModal();
  };

  if (!visible) {
    return null;
  }

  const showAdvancedOptions =
    profileEditorConfig.settings.showProfileAdvancedOptions;

  return (
    <ClosableOverlay close={closeModal}>
      <CommonDialogFrame
        caption={texts.assignerProfileConfigModal.modalTitle}
        close={closeModal}
      >
        <div class={cssDialogContent}>
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
