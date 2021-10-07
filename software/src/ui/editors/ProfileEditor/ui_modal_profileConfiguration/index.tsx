import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { ClosableOverlay, CommonDialogFrame } from '~/ui/components';
import { DualModeSettingsPart } from '~/ui/editors/ProfileEditor/ui_modal_profileConfiguration/DualModeSettingsPart';
import { KeyboardProjectSelectionPart } from '~/ui/editors/ProfileEditor/ui_modal_profileConfiguration/KeyboardProjectSelectionPart';
import { ShiftCancelOptionPart } from '~/ui/editors/ProfileEditor/ui_modal_profileConfiguration/ShiftCancelOptionPart';
import { uiReaders, uiState } from '~/ui/store';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';

export const ProfileConfigurationModalLayer: FC = () => {
  const visible = uiState.profileConfigModalVisible;
  const closeModal = () => {
    uiState.profileConfigModalVisible = false;
  };

  if (!visible) {
    return null;
  }

  const showProjectSelectionUi =
    uiReaders.isDeveloperMode && !uiReaders.globalSettings.globalProjectSpec;

  return (
    <ClosableOverlay close={closeModal}>
      <CommonDialogFrame
        caption={texts.label_assigner_profileConfigModal_modalTitle}
        close={closeModal}
      >
        <div css={cssDialogContent}>
          <KeyboardProjectSelectionPart qxIf={showProjectSelectionUi} />
          <AssignTypeSelectionPart />
          <DualModeSettingsPart />
          <ShiftCancelOptionPart />
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
