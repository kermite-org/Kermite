import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import {
  ConnectedDeviceAttrsPart,
  CustomParametersPart,
  DeviceSelectionPart,
  FirmwareUpdatePart,
} from '~/ui/pages/firmware-update-page/sections';

export const FirmwareUpdatePage: FC = () => {
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

      <FirmwareUpdatePart />
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
