import { css, jsx } from 'alumina';
import { FcWithClassName, texts } from '~/ui/base';
import {
  GeneralButtonMenu,
  KeyboardProfileSelector,
  OperationButtonWithIcon,
} from '~/ui/components';
import { ConfigurationButton } from '~/ui/elements';
import {
  BehaviorSelector,
  LayoutStandardSelector,
  MuteModeSelector,
  RoutingChannelSelector,
} from '~/ui/featureEditors/ProfileEditor/ui_editor_sideConfigPart/blocks/ConfigSelectors';
import { createProfileSelectionMenuItems } from '~/ui/pages/assigner-page/ui_bar_profileManagement/viewModels/ProfileSelectionMenuItemCreator';
import { useProfileSelectorModel } from '~/ui/pages/assigner-page/ui_bar_profileManagement/viewModels/ProfileSelectorModel';
import { makeProfilesOperationModel } from '~/ui/pages/assigner-page/ui_bar_profileManagement/viewModels/ProfilesOperationModel';
import { SavingProjectPresetSelectionModal } from '~/ui/pages/assigner-page/ui_bar_profileManagement/views/SavingProjectPresetSelectionModal';

export const ProfileManagementPart: FcWithClassName = ({ className }) => {
  const baseVm = makeProfilesOperationModel();
  const { profileSelectorSource } = useProfileSelectorModel();
  const menuItems = createProfileSelectionMenuItems(baseVm);

  return (
    <div css={style} className={className}>
      <GeneralButtonMenu
        menuItems={menuItems}
        hint={texts.hint_assigner_topBar_profileOperationsMenu}
      />

      <KeyboardProfileSelector
        selectorSource={profileSelectorSource}
        hint={texts.hint_assigner_topBar_selectCurrentProfile}
        disabled={!baseVm.isEditProfileAvailable}
      />
      <ConfigurationButton
        onClick={baseVm.openConfiguration}
        iconSpec="fa fa-cog"
        data-hint={texts.hint_assigner_topBar_profileConfigurationButton}
        disabled={!baseVm.isEditProfileAvailable}
      />
      <ConfigurationButton
        onClick={baseVm.toggleRoutingPanel}
        iconSpec="fa fa-list"
        disabled={!baseVm.isEditProfileAvailable}
      />

      <div class="spacer" />
      <div class="mode-selectors-box" if={false}>
        <BehaviorSelector />
        <MuteModeSelector />
        <LayoutStandardSelector />
        <RoutingChannelSelector />
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

      {baseVm.modalState !== 'None' && (
        <SavingProjectPresetSelectionModal baseVm={baseVm} />
      )}
    </div>
  );
};

const style = css`
  /* background: #024; */
  flex-grow: 1;
  display: flex;
  align-items: center;
  padding: 4px 6px;
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
