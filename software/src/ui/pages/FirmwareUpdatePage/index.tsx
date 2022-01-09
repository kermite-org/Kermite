import { css, FC, jsx } from 'alumina';
import { CommonPageFrame } from '~/ui/components';
import {
  ConnectedDeviceAttrsPart,
  CustomParametersPart,
  DeviceSelectionPart,
  FirmwareUpdatePart,
} from '~/ui/pages/FirmwareUpdatePage/sections';

export const FirmwareUpdatePage: FC = () => {
  return (
    <CommonPageFrame>
      <div class={style}>
        <div class="topRow">
          <div class="leftColumn">
            <DeviceSelectionPart />
            <CustomParametersPart />
          </div>
          <div class="rightColumn">
            <ConnectedDeviceAttrsPart />
          </div>
        </div>

        <FirmwareUpdatePart />
      </div>
    </CommonPageFrame>
  );
};

const style = css`
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
