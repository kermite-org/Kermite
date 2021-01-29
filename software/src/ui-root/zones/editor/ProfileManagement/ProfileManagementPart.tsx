import { css } from 'goober';
import { h, Hook } from 'qx';
import { KeyboardProfileSelector } from '~/ui-common/sharedViews/fabrics/KeyboardProfileSelector';
import { ConfigurationButton } from '~/ui-root/zones/common/parts/controls/ConfigurationButton';
import { LaunchButton } from '~/ui-root/zones/common/parts/controls/LaunchButton';
import { keyboardConfigModel } from '~/ui-root/zones/editor/ProfileManagement/models/KeyboardConfigModel';
import { makeProfileManagementPartViewModel } from '~/ui-root/zones/editor/ProfileManagement/viewModels/ProfileManagementPartViewModel';
import { makeProfileSelectionMenuPartViewModel } from '~/ui-root/zones/editor/ProfileManagement/viewModels/ProfileSelectionMenuPartViewModel';
import {
  BehaviorSelector,
  LayoutStandardSelector,
} from '~/ui-root/zones/editor/ProfileManagement/views/ConfigSelectors';
import { SavingProjectPresetSelectionModal } from '~/ui-root/zones/editor/ProfileManagement/views/SavingProjectPresetSelectionModal';
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
