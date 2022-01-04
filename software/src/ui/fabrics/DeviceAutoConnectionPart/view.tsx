import { css, FC, jsx } from 'alumina';
import { IProjectPackageInfo } from '~/shared';
import { texts } from '~/ui/base';
import { deviceAutoConnectionPartAssets } from '~/ui/fabrics/DeviceAutoConnectionPart/assets';
import { useDeviceAutoConnectionEffects } from '~/ui/fabrics/DeviceAutoConnectionPart/hooks';
import { multiClasses } from '~/ui/utils';

const { SvgIllustPc, SvgIllustThunder, SvgIllustMcu } =
  deviceAutoConnectionPartAssets;

type Props = {
  projectInfo: IProjectPackageInfo;
  variationId: string;
};

export const DeviceAutoConnectionPart: FC<Props> = ({
  projectInfo,
  variationId,
}) => {
  const { isConnectionValid, isCommunicationIndicatorActive } =
    useDeviceAutoConnectionEffects(projectInfo.projectId, variationId);
  const { keyboardName } = projectInfo;

  const connectionStatusText = isConnectionValid
    ? texts.deviceAutoConnectionSection.status_connected
    : texts.deviceAutoConnectionSection.status_noDeviceAvailable;

  return (
    <div class={style}>
      <div className="indicators">
        <div class={['indicator', isConnectionValid && '--active']} />
        <div
          class={['indicator', isCommunicationIndicatorActive && '--active']}
        />
      </div>
      <div class="keyboard-name-text">
        {texts.deviceAutoConnectionSection.targetKeyboard}: {keyboardName}
      </div>

      <div class="illust-area">
        <SvgIllustPc class="pc" />
        <SvgIllustThunder
          class={multiClasses('thunder', isConnectionValid && '--active')}
        />
        <SvgIllustMcu
          class={multiClasses('mcu', isConnectionValid && '--active')}
        />
      </div>
      <div class="status-text-part">{connectionStatusText}</div>
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
    margin-top: 5px;
    display: flex;
    justify-content: center;
    font-size: 32px;
  }
`;
