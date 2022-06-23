import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
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
} from '~/ui/featureEditors/profileEditor/ui_editor_sideConfigPart/blocks/ConfigSelectors';
import { createProfileSelectionMenuItems } from '~/ui/pages/assignerPage/ui_bar_profileManagement/viewModels/profileSelectionMenuItemCreator';
import { useProfileSelectorModel } from '~/ui/pages/assignerPage/ui_bar_profileManagement/viewModels/profileSelectorModel';
import { makeProfilesOperationModel } from '~/ui/pages/assignerPage/ui_bar_profileManagement/viewModels/profilesOperationModel';
import { SavingProjectPresetSelectionModal } from '~/ui/pages/assignerPage/ui_bar_profileManagement/views/SavingProjectPresetSelectionModal';

export const ProfileManagementPart: FC = () => {
  const baseVm = makeProfilesOperationModel();
  const { profileSelectorSource } = useProfileSelectorModel();
  const menuItems = createProfileSelectionMenuItems(baseVm);

  return (
    <div class={style}>
      <GeneralButtonMenu
        menuItems={menuItems}
        hint={texts.assignerTopBarHint.profileOperationsMenu}
      />

      <KeyboardProfileSelector
        selectorSource={profileSelectorSource}
        hint={texts.assignerTopBarHint.selectCurrentProfile}
        disabled={!baseVm.isEditProfileAvailable}
      />
      <ConfigurationButton
        onClick={baseVm.openConfiguration}
        iconSpec="fa fa-cog"
        data-hint={texts.assignerTopBarHint.profileConfigurationButton}
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
          label={texts.assignerTopBar.saveAssignsButton}
          hint={texts.assignerTopBarHint.saveAssignsButton}
        />
        <OperationButtonWithIcon
          onClick={baseVm.onWriteButton}
          disabled={!baseVm.canWrite}
          icon="double_arrow"
          label={texts.assignerTopBar.writeAssignsButton}
          hint={texts.assignerTopBarHint.writeAssignsButton}
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
