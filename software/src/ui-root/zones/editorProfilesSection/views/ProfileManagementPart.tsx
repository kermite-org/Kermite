import { css } from 'goober';
import { h } from 'qx';
import { ConfigurationButton } from '~/ui-root/zones/common/parts/controls/ConfigurationButton';
import { LaunchButton } from '~/ui-root/zones/common/parts/controls/LaunchButton';
import { KeyboardProfileSelector } from '~/ui-root/zones/common/parts/fabrics/KeyboardProfileSelector';
import { makeProfileManagementPartViewModel } from '~/ui-root/zones/editorProfilesSection/viewModels/ProfileManagementPartViewModel';
import { makeProfileSelectionMenuPartViewModel } from '~/ui-root/zones/editorProfilesSection/viewModels/ProfileSelectionMenuPartViewModel';
import {
  BehaviorSelector,
  LayoutStandardSelector,
} from '~/ui-root/zones/editorProfilesSection/views/ConfigSelectors';
import { SavingProjectPresetSelectionModal } from '~/ui-root/zones/editorProfilesSection/views/SavingProjectPresetSelectionModal';
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
