import { css } from 'goober';
import { h } from 'qx';
import { makeDeviceControlSectionViewModel } from '@ui-root/viewModels/DeviceControlSectionViewModel';
import { LinkIndicator } from '@ui-root/views/controls/LinkIndicator';

const cssDeviceControlSection = css`
  display: flex;
  align-items: center;
  margin-right: 15px;

  > * + * {
    margin-left: 7px;
  }
`;

export const DeviceControlSection = () => {
  const vm = makeDeviceControlSectionViewModel();
  return (
    <div css={cssDeviceControlSection}>
      <div>{vm.currentDeviceKeyboardName}</div>
      <LinkIndicator isActive={vm.isDeviceConnected} />
    </div>
  );
};
