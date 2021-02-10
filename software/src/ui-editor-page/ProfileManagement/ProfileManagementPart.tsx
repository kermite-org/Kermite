import { css } from 'goober';
import { h, Hook } from 'qx';
import { KeyboardProfileSelector } from '~/ui-common/components';
import { keyboardConfigModel } from '~/ui-editor-page/ProfileManagement/models/KeyboardConfigModel';
import { makeProfileManagementPartViewModel } from '~/ui-editor-page/ProfileManagement/viewModels/ProfileManagementPartViewModel';
import { makeProfileSelectionMenuPartViewModel } from '~/ui-editor-page/ProfileManagement/viewModels/ProfileSelectionMenuPartViewModel';
import {
  BehaviorSelector,
  LayoutStandardSelector,
} from '~/ui-editor-page/ProfileManagement/views/ConfigSelectors';
import { SavingProjectPresetSelectionModal } from '~/ui-editor-page/ProfileManagement/views/SavingProjectPresetSelectionModal';
import { ConfigurationButton } from '~/ui-editor-page/components/controls/ConfigurationButton';
import { LaunchButton } from '~/ui-editor-page/components/controls/LaunchButton';
import { ProfileSelectionMenuPart } from './views/ProfileSelectionMenu';

const cssProfileManagementPart = css`
  /* background: #024; */
  display: flex;
  align-items: center;
  padding: 4px;
  button {
    padding: 0 4px;
  }
  > * + * {
    margin-left: 10px;
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
      <KeyboardProfileSelector selectorSource={baseVm.profileSelectorSource} />
      <ConfigurationButton onClick={baseVm.openConfiguration} />
      <BehaviorSelector />
      <LayoutStandardSelector />
      <LaunchButton onClick={baseVm.onLaunchButton} />
      {baseVm.isExportingPresetSelectionModalOpen && (
        <SavingProjectPresetSelectionModal baseVm={baseVm} />
      )}
    </div>
  );
};
