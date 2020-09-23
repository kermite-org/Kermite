import { css } from 'goober';
import { h } from '~lib/qx';
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
