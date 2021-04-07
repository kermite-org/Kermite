import { css, jsx } from 'qx';
import { uiTheme } from '~/ui-common';
import {
  ConnectedDeviceAttrsPart,
  CustomParametersPart,
  DeviceSelectionPart,
  FirmwareUpdationPart,
} from '~/ui/firmware-updation-page/sections';

const cssPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 30px;

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
