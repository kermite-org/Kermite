import { css, FC, jsx } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { deviceAutoConnectionPartAssets } from '~/ui/fabrics/DeviceAutoConnectionPart/assets';
import { useDeviceAutoConnectionEffects } from '~/ui/fabrics/DeviceAutoConnectionPart/hooks';
import { multiClasses } from '~/ui/utils';

const { SvgIllustPc, SvgIllustThunder, SvgIllustMcu } =
  deviceAutoConnectionPartAssets;

type Props = {
  projectInfo: IProjectPackageInfo;
  firmwareVariationId: string;
};

export const DeviceAutoConnectionPart: FC<Props> = ({
  projectInfo,
  firmwareVariationId,
}) => {
  const { isConnectionValid, isCommunicationIndicatorActive } =
    useDeviceAutoConnectionEffects(projectInfo.projectId, firmwareVariationId);
  const { keyboardName } = projectInfo;

  return (
    <div class={style}>
      <div className="indicators">
        <div classNames={['indicator', isConnectionValid && '--active']} />
        <div
          classNames={[
            'indicator',
            isCommunicationIndicatorActive && '--active',
          ]}
        />
      </div>
      <div class="keyboard-name-text">target keyboard: {keyboardName}</div>

      <div class="illust-area">
        <SvgIllustPc class="pc" />
        <SvgIllustThunder
          class={multiClasses('thunder', isConnectionValid && '--active')}
        />
        <SvgIllustMcu
          class={multiClasses('mcu', isConnectionValid && '--active')}
        />
      </div>
      <div class="status-text-part">
        {isConnectionValid ? 'Device Connected' : 'No Device Available'}
      </div>
    </div>
  );
};

const inactiveAlpha = 0.3;
const style = css`
  > .indicators {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    > .indicator {
      width: 10px;
      height: 10px;
      border: solid 1px #0a0;
      border-radius: 50%;
      background: #ccc;
      &.--active {
        background: #0f0;
      }
      transition: all 0.1s;
    }
  }

  > .keyboard-name-text {
    text-align: right;
  }

  > .illust-area {
    margin-top: 10px;

    display: flex;
    align-items: center;
    gap: 30px;

    > .pc {
      margin-top: 10px;
    }

    > .thunder {
      opacity: ${inactiveAlpha};
      &.--active {
        opacity: 1;
        > g > g > path {
          fill: rgb(255, 234, 0) !important;
        }
      }
    }

    > .mcu {
      opacity: ${inactiveAlpha};
      &.--active {
        opacity: 1;
      }
    }
  }

  > .status-text-part {
    margin-top: 10px;
    display: flex;
    justify-content: center;
    font-size: 32px;
  }
`;
