import { css } from 'goober';
import { h } from '~lib/qx';
import { LaunchButton } from './LaunchButton';
import { BehaviorSelector, LayoutStandardSelector } from './ConfigSelectors';
import { LinkIndicator } from './LinkIndicator';

export const DeviceControlSection = () => {
  const cssDeviceControlSection = css`
    display: flex;
    align-items: center;
    > * {
      margin-right: 15px;
    }
  `;

  return (
    <div css={cssDeviceControlSection}>
      <LinkIndicator />
    </div>
  );
};
