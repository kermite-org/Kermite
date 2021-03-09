import { css, jsx } from 'qx';
import { uiTheme } from '~/ui-common';
import { ConnectedDeviceAttrsPart } from '~/ui-firmware-updation-page/ConnectedDeviceAttrsPart';
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

  > .topRow {
    display: flex;

    > .leftColumn {
      > * + * {
        margin-top: 40px;
      }
    }
    > .rightColumn {
      margin-left: 50px;
    }
  }
`;

export const FirmwareUpdationPage = () => {
  return (
    <div css={cssPage}>
      <div className="topRow">
        <div className="leftColumn">
          <DeviceSelectionPart />
          <CustomParametersPart />
        </div>
        <div className="rightColumn">
          <ConnectedDeviceAttrsPart />
        </div>
      </div>

      <FirmwareUpdationPart />
    </div>
  );
};
