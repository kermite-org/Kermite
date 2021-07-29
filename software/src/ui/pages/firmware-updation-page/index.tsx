import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import {
  ConnectedDeviceAttrsPart,
  CustomParametersPart,
  DeviceSelectionPart,
  FirmwareUpdationPart,
} from '~/ui/pages/firmware-updation-page/sections';

export const FirmwareUpdationPage: FC = () => {
  return (
    <div css={style}>
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

const style = css`
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
