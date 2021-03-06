import { css, jsx } from 'qx';
import { uiTheme } from '~/ui-common';
import { CustomParametersPart } from '~/ui-firmware-updation-page/CustomParametersPart';
import { DeviceSelectionPart } from '~/ui-firmware-updation-page/DeviceSelectionPart';
import { FirmwareUpdationPart } from '~/ui-firmware-updation-page/FirmwareUpdationPart';

const cssPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 20px;

  > * + * {
    margin-top: 40px;
  }
`;

export const FirmwareUpdationPage = () => {
  return (
    <div css={cssPage}>
      <DeviceSelectionPart />
      <CustomParametersPart />
      <FirmwareUpdationPart />
    </div>
  );
};
