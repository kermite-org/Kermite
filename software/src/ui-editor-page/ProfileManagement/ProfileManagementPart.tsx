import { css } from 'goober';
import { h, Hook } from 'qx';
import {
  KeyboardProfileSelector,
  OperationButtonWithIcon,
} from '~/ui-common/components';
import { keyboardConfigModel } from '~/ui-editor-page/ProfileManagement/models/KeyboardConfigModel';
import { makeProfileManagementPartViewModel } from '~/ui-editor-page/ProfileManagement/viewModels/ProfileManagementPartViewModel';
import { makeProfileSelectionMenuPartViewModel } from '~/ui-editor-page/ProfileManagement/viewModels/ProfileSelectionMenuPartViewModel';
import {
  BehaviorSelector,
  LayoutStandardSelector,
} from '~/ui-editor-page/ProfileManagement/views/ConfigSelectors';
import { SavingProjectPresetSelectionModal } from '~/ui-editor-page/ProfileManagement/views/SavingProjectPresetSelectionModal';
import { ConfigurationButton } from '~/ui-editor-page/components/controls/ConfigurationButton';
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
    margin-left: 10px;
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
        hint="Select current profile."
      />
      <ConfigurationButton onClick={baseVm.openConfiguration} />
      <BehaviorSelector />
      <LayoutStandardSelector />
      <div class="spacer" />
      <OperationButtonWithIcon
        onClick={baseVm.onLaunchButton}
        label="write"
        icon="double_arrow"
        hint="Save edit profile and write keymapping to the device."
      />
      {baseVm.isExportingPresetSelectionModalOpen && (
        <SavingProjectPresetSelectionModal baseVm={baseVm} />
      )}
    </div>
  );
};
