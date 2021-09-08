import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { uiReaders, uiState } from '~/ui/commonStore';
import { ClosableOverlay, CommonDialogFrame } from '~/ui/components';
import { KeyboardProjectSelectionPart } from '~/ui/pages/editor-core/ui_modal_profileConfiguration/KeyboardProjectSelectionPart';
import { ShiftCancelOptionPart } from '~/ui/pages/editor-core/ui_modal_profileConfiguration/ShiftCancelOptionPart';
import { AssignTypeSelectionPart } from './AssignTypeSelectionPart';

export const ProfileConfigratuionModalLayer: FC = () => {
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
          {/* Dualモードの挙動オプションUI, ロジックでのオプション変更への対応が未実装のため非表示 */}
          {/* <DualModeSettingsPart /> */}
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