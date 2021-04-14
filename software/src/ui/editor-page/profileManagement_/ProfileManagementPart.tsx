import { css, Hook, jsx } from 'qx';
import { texts } from '~/ui/common';
import {
  KeyboardProfileSelector,
  OperationButtonWithIcon,
} from '~/ui/common/components';
import { ConfigurationButton } from '~/ui/editor-page/components/controls/ConfigurationButton';
import { keyboardConfigModel } from '~/ui/editor-page/profileManagement_/models/KeyboardConfigModel';
import { makeProfileManagementPartViewModel } from '~/ui/editor-page/profileManagement_/viewModels/ProfileManagementPartViewModel';
import { makeProfileSelectionMenuPartViewModel } from '~/ui/editor-page/profileManagement_/viewModels/ProfileSelectionMenuPartViewModel';
import {
  BehaviorSelector,
  LayoutStandardSelector,
} from '~/ui/editor-page/profileManagement_/views/ConfigSelectors';
import { SavingProjectPresetSelectionModal } from '~/ui/editor-page/profileManagement_/views/SavingProjectPresetSelectionModal';
import { ProfileSelectionMenuPart } from './views/ProfileSelectionMenu';

const cssProfileManagementPart = css`
  /* background: #024; */
  flex-grow: 1;
  margin-right: 80px;
  display: flex;
  align-items: center;
  padding: 4px;
  button {
    padding: 0 4px;
  }
  > * + * {
    margin-left: 15px;
  }
  > .spacer {
    flex-grow: 1;
  }
`;

export const ProfileManagementPart = () => {
  const baseVm = makeProfileManagementPartViewModel();
  const menuModel = makeProfileSelectionMenuPartViewModel(baseVm);

  Hook.useEffect(() => {
    keyboardConfigModel.initialize();
  }, []);

  return (
    <div css={cssProfileManagementPart}>
      <ProfileSelectionMenuPart vm={menuModel} />
      <KeyboardProfileSelector
        selectorSource={baseVm.profileSelectorSource}
        hint={texts.hint_assigner_topBar_selectCurrentProfile}
      />
      <ConfigurationButton onClick={baseVm.openConfiguration} />
      <BehaviorSelector />
      <LayoutStandardSelector />
      <div class="spacer" />
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
      {baseVm.isExportingPresetSelectionModalOpen && (
        <SavingProjectPresetSelectionModal baseVm={baseVm} />
      )}
    </div>
  );
};
