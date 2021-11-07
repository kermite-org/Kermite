import { css, FC, jsx } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { texts } from '~/ui/base';
import { useModalDisplayStateModel } from '~/ui/commonModels';
import { GeneralButton } from '~/ui/components';
import { svgImage_resetByHand } from '~/ui/constants';
import { BoardResetInstructionPanel } from '~/ui/fabrics/StandardFirmwareFlashPart/BoardResetInstructionPanel/view';
import { useStandardFirmwareFlashPartModel } from '~/ui/fabrics/StandardFirmwareFlashPart/model';

type Props = {
  projectInfo: IProjectPackageInfo;
  variationId: string;
};

export const StandardFirmwareFlashPart: FC<Props> = ({
  projectInfo,
  variationId,
}) => {
  const {
    phase,
    detectedDeviceSig,
    canFlashFirmwareToDetectedDevice,
    onWriteButton,
    targetDeviceType,
  } = useStandardFirmwareFlashPartModel(projectInfo, variationId);

  const {
    isOpen: isPanelOpen,
    open: openPanel,
    close: closePanel,
  } = useModalDisplayStateModel();

  return (
    <div css={style}>
      <div class="top-row">
        <div class="target-mcu-text">
          {targetDeviceType && `target mcu: ${targetDeviceType}`}
        </div>

        <div class="how-to-reset" onClick={openPanel}>
          how to reset
        </div>
      </div>

      <div class="image-box">{svgImage_resetByHand}</div>
      <div class="text-part">
        {phase === 'WaitingReset' && <div>reset device to flash firmware</div>}

        {phase === 'WaitingUploadOrder' && detectedDeviceSig && (
          <div class="row">
            <div>
              {texts.label_device_firmwareUpdate_deviceDetected.replace(
                '{DEVICE_NAME}',
                detectedDeviceSig,
              )}
            </div>
            {canFlashFirmwareToDetectedDevice && (
              <GeneralButton
                onClick={onWriteButton}
                text={texts.label_device_firmwareUpdate_writeButton}
                class="btn"
              />
            )}
          </div>
        )}

        {phase === 'WaitingUploadOrder' &&
          detectedDeviceSig &&
          !canFlashFirmwareToDetectedDevice && (
            <div className="note">
              Selected firmware is not supposed to be flashed into this device.
            </div>
          )}

        {phase === 'Uploading' && (
          <div>
            <div>{texts.label_device_firmwareUpdate_writing}</div>
          </div>
        )}
      </div>
      <BoardResetInstructionPanel isOpen={isPanelOpen} close={closePanel} />
    </div>
  );
};

const style = css`
  > .top-row {
    width: 300px;
    margin: 0 auto;
    margin-top: 10px;
    display: flex;
    align-items: center;

    > .how-to-reset {
      margin-left: auto;
      color: #999;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  > .image-box {
    margin: 20px auto;
    width: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    border: solid 1px #aaa;
    border-radius: 6px;
    overflow: hidden;
  }

  > .text-part {
    width: 300px;
    margin: 0 auto;
    margin-top: 15px;

    > .row {
      display: flex;

      > .btn {
        flex-shrink: 0;
      }
    }
  }
`;