import { css, jsx } from 'qx';
import { texts } from '~/ui/base';
import { uiStatusModel } from '~/ui/commonModels/UiStatusModel';
import { ClosableOverlay, CommonDialogFrame } from '~/ui/components';
import { KeyboardProjectSelectionPart } from '~/ui/pages/editor-page/ui_modal_profileConfiguration/KeyboardProjectSelectionPart';
import { ShiftCancelOptionPart } from '~/ui/pages/editor-page/ui_modal_profileConfiguration/ShiftCancelOptionPart';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';

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
          {/* Dualモードの挙動オプションUI, ロジックでのオプション変更への対応が未実装のため非表示 */}
          {/* <DualModeSettingsPart /> */}
          <ShiftCancelOptionPart />
        </div>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};
