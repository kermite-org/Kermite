import { css, jsx } from 'qx';
import { texts } from '~/ui/common';
import { ClosableOverlay, CommonDialogFrame } from '~/ui/common/components';
import { uiStatusModel } from '~/ui/common/sharedModels/UiStatusModel';
import { KeyboardProjectSelectionPart } from '~/ui/editor-page/ui_modal_profileConfiguration/KeyboardProjectSelectionPart';
import { ShiftCancelOptionPart } from '~/ui/editor-page/ui_modal_profileConfiguration/ShiftCancelOptionPart';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';
import { DualModeSettingsPart } from './DualModeSettingsPart';

export const ProfileConfigratuionModalLayer = () => {
  const uiStatus = uiStatusModel.status;
  const visible = uiStatus.profileConfigModalVisible;
  const closeModal = () => {
    uiStatus.profileConfigModalVisible = false;
  };

  if (!visible) {
    return null;
  }

  const cssDialogContent = css`
    margin: 10px;
    color: black;
    min-height: 140px;

    > * + * {
      margin-top: 10px;
    }
  `;

  return (
    <ClosableOverlay close={closeModal}>
      <CommonDialogFrame
        caption={texts.label_assigner_profileConfigModal_modalTitle}
        close={closeModal}
      >
        <div css={cssDialogContent}>
          <KeyboardProjectSelectionPart />
          <AssignTypeSelectionPart />
          <DualModeSettingsPart />
          <ShiftCancelOptionPart />
        </div>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};
