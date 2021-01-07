import { css } from 'goober';
import { makeDeviceControlSectionViewModel } from '~ui/viewModels/DeviceControlSectionViewModel';
import { LinkIndicator } from '~ui/views/controls/LinkIndicator';
import { h } from '~qx';

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
