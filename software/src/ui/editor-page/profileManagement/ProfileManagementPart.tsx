import { css, jsx } from 'qx';
import { FcWithClassName, texts } from '~/ui/common';
import {
  GeneralButton,
  KeyboardProfileSelector,
  OperationButtonWithIcon,
} from '~/ui/common/components';
import { ConfigurationButton } from '~/ui/editor-page/components/controls/ConfigurationButton';
import { makeProfileManagementPartViewModel } from '~/ui/editor-page/profileManagement/viewModels/ProfileManagementPartViewModel';
import { makeProfileSelectionMenuPartViewModel } from '~/ui/editor-page/profileManagement/viewModels/ProfileSelectionMenuPartViewModel';
import {
  BehaviorSelector,
  LayoutStandardSelector,
} from '~/ui/editor-page/profileManagement/views/ConfigSelectors';
import { SavingProjectPresetSelectionModal } from '~/ui/editor-page/profileManagement/views/SavingProjectPresetSelectionModal';
import { ProfileSelectionMenuPart } from './views/ProfileSelectionMenu';

const cssProfileManagementPart = css`
  /* background: #024; */
  flex-grow: 1;
  display: flex;
  align-items: center;
  padding: 4px;
  gap: 0 15px;
  button {
    padding: 0 4px;
  }
  > .spacer {
    flex-grow: 1;
  }

  > .mode-selectors-box {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-right: 15px;
  }

  > .operation-buttons-box {
    display: flex;
    align-items: center;
    gap: 20px;
  }
`;

export const ProfileManagementPart: FcWithClassName = ({ className }) => {
  const baseVm = makeProfileManagementPartViewModel();
  const menuModel = makeProfileSelectionMenuPartViewModel(baseVm);

  return (
    <div css={cssProfileManagementPart} className={className}>
      <ProfileSelectionMenuPart vm={menuModel} />
      <KeyboardProfileSelector
        selectorSource={baseVm.profileSelectorSource}
        hint={texts.hint_assigner_topBar_selectCurrentProfile}
      />
      <ConfigurationButton onClick={baseVm.openConfiguration} />

      <p onClick={baseVm.toggleRoutingPanel} style={{ cursor: 'pointer' }}>
        <i class="fa fa-list" />
      </p>

      <div class="spacer" />
      <div class="mode-selectors-box">
        <BehaviorSelector />
        <LayoutStandardSelector />
      </div>

      <div class="operation-buttons-box">
        <OperationButtonWithIcon
          onClick={baseVm.onSaveButton}
          disabled={!baseVm.canSave}
          icon="save"
          label={texts.label_assigner_topBar_saveAssignsButton}
          hint={texts.hint_assigner_topBar_saveAssignsButton}
        />
        <OperationButtonWithIcon
          onClick={baseVm.onWriteButton}
          disabled={!baseVm.canWrite}
          icon="double_arrow"
          label={texts.label_assigner_topBar_writeAssignsButton}
          hint={texts.hint_assigner_topBar_writeAssignsButton}
        />
      </div>

      {baseVm.isExportingPresetSelectionModalOpen && (
        <SavingProjectPresetSelectionModal baseVm={baseVm} />
      )}
    </div>
  );
};
