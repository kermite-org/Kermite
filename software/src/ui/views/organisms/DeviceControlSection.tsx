import { css } from 'goober';
import { h } from '~lib/qx';
import { makeDeviceControlSectionViewModel } from '~ui/viewModels/DeviceControlSectionViewModel';
import { LinkIndicator } from '~ui/views/controls/LinkIndicator';

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
      <div>{vm.currentDeviceProjectName}</div>
      <LinkIndicator isActive={vm.isDeviceConnected} />
    </div>
  );
};
