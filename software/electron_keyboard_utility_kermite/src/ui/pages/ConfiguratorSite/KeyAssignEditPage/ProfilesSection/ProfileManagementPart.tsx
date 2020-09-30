import { css } from 'goober';
import { h } from '~lib/qx';
import {
  makeProfileManagementViewModel,
  IProfileManagerViewModel
} from './ProfileManagementPart.model';
import { reflectValue } from '~ui/common/FormHelpers';
import { ProfileSelectionMenuPart } from './ProfileSelectionMenu';
import {
  BehaviorSelector,
  LayoutStandardSelector
} from '../DeviceControlSection/ConfigSelectors';
import { LaunchButton } from '../DeviceControlSection/LaunchButton';
import { ConfigurationButton } from '../DeviceControlSection/ConfigurationButton';

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
