import { css } from 'goober';
import { h } from 'qx';
import { makeProfileManagementPartViewModel } from '~/viewModels/ProfileManagementPartViewModel';
import { makeProfileSelectionMenuPartViewModel } from '~/viewModels/ProfileSelectionMenuPartViewModel';
import { ConfigurationButton } from '~/views/controls/ConfigurationButton';
import { LaunchButton } from '~/views/controls/LaunchButton';
import { KeyboardProfileSelector } from '~/views/fabrics/KeyboardProfileSelector';
import {
  BehaviorSelector,
  LayoutStandardSelector,
} from '~/views/organisms/ProfilesSection/ConfigSelectors';
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
