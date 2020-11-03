import { css } from 'goober';
import { h } from '~lib/qx';
import { reflectValue } from '~ui/base/FormHelpers';
import {
  BehaviorSelector,
  LayoutStandardSelector
} from '../DeviceControlSection/ConfigSelectors';
import { ConfigurationButton } from '../DeviceControlSection/ConfigurationButton';
import { LaunchButton } from '../DeviceControlSection/LaunchButton';
import {
  makeProfileManagementViewModel,
  IProfileManagerViewModel
} from './ProfileManagementPart.model';
import { ProfileSelectionMenuPart } from './ProfileSelectionMenu';

const ProfileSelectorView = (props: { vm: IProfileManagerViewModel }) => {
  const { vm } = props;
  return (
    <div>
      <select
        onChange={reflectValue(vm.loadProfile)}
        value={vm.currentProfileName}
      >
        {vm.allProfileNames.map((profName) => (
          <option key={profName} value={profName}>
            {profName}
          </option>
        ))}
      </select>
    </div>
  );
};

export const ProfileManagementPart = () => {
  const cssProfileSelectionRow = css`
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

  const vm = makeProfileManagementViewModel();

  return (
    <div css={cssProfileSelectionRow}>
      <ProfileSelectionMenuPart vm={vm} />
      <ProfileSelectorView vm={vm} />
      <ConfigurationButton />
      <BehaviorSelector />
      <LayoutStandardSelector />
      <LaunchButton />
    </div>
  );
};
