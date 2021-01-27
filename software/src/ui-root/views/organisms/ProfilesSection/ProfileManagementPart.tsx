import { css } from 'goober';
import { h } from 'qx';
import { makeProfileManagementPartViewModel } from '~/ui-root/viewModels/ProfileManagementPartViewModel';
import { makeProfileSelectionMenuPartViewModel } from '~/ui-root/viewModels/ProfileSelectionMenuPartViewModel';
import { ConfigurationButton } from '~/ui-root/views/controls/ConfigurationButton';
import { LaunchButton } from '~/ui-root/views/controls/LaunchButton';
import { KeyboardProfileSelector } from '~/ui-root/views/fabrics/KeyboardProfileSelector';
import {
  BehaviorSelector,
  LayoutStandardSelector,
} from '~/ui-root/views/organisms/ProfilesSection/ConfigSelectors';
import { SavingProjectPresetSelectionModal } from '~/ui-root/views/organisms/ProfilesSection/SavingProjectPresetSelectionModal';
import { ProfileSelectionMenuPart } from './ProfileSelectionMenu';

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
