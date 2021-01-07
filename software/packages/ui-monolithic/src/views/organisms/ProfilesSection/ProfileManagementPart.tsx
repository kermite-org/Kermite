import { css } from 'goober';
import { makeProfileManagementPartViewModel } from '~ui/viewModels/ProfileManagementPartViewModel';
import { makeProfileSelectionMenuPartViewModel } from '~ui/viewModels/ProfileSelectionMenuPartViewModel';
import { ConfigurationButton } from '~ui/views/controls/ConfigurationButton';
import { LaunchButton } from '~ui/views/controls/LaunchButton';
import { KeyboardProfileSelector } from '~ui/views/fabrics/KeyboardProfileSelector';
import {
  BehaviorSelector,
  LayoutStandardSelector,
} from '~ui/views/organisms/ProfilesSection/ConfigSelectors';
import { ProfileSelectionMenuPart } from './ProfileSelectionMenu';
import { h } from '~qx';

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
