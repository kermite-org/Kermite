import { css } from 'goober';
import { h } from '~lib/qx';
import { models } from '~ui/models';
import { LinkIndicator } from './LinkIndicator';

export const DeviceControlSection = () => {
  const cssDeviceControlSection = css`
    display: flex;
    align-items: center;
    margin-right: 15px;

    > * + * {
      margin-left: 7px;
    }
  `;

  const currentDeviceProjectName =
    models.deviceStatusModel.deviceAttrs?.projectName || '';

  return (
    <div css={cssDeviceControlSection}>
      <div>{currentDeviceProjectName}</div>
      <LinkIndicator />
    </div>
  );
};
