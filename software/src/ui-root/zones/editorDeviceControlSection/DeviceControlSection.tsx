import { css } from 'goober';
import { h } from 'qx';
import { LinkIndicator } from '~/ui-root/zones/common/parts/controls/LinkIndicator';
import { makeDeviceControlSectionViewModel } from '~/ui-root/zones/editorDeviceControlSection/DeviceControlSectionViewModel';

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
