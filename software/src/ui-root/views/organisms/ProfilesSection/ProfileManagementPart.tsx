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
  const vm = makeProfileManagementPartViewModel();
  const menuModel = makeProfileSelectionMenuPartViewModel(vm);

  return (
    <div css={cssProfileManagementPart}>
      <ProfileSelectionMenuPart vm={menuModel} />
      <KeyboardProfileSelector selectorSource={vm.profileSelectorSource} />
      <ConfigurationButton onClick={vm.openConfiguration} />
      <BehaviorSelector />
      <LayoutStandardSelector />
      <LaunchButton onClick={vm.onLaunchButton} />
    </div>
  );
};
