import { css, FC, jsx } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { texts } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { svgImage_resetByHand } from '~/ui/constants';
import { useStandardFirmwareFlashPartModel } from '~/ui/fabrics/StandardFirmwareFlashPart/model';

type Props = {
  projectInfo: IProjectPackageInfo;
  firmwareVariationId: string;
};

export const StandardFirmwareFlashPart: FC<Props> = ({
  projectInfo,
  firmwareVariationId,
}) => {
  const {
    phase,
    detectedDeviceSig,
    canFlashFirmwareToDetectedDevice,
    onWriteButton,
    targetDeviceType,
  } = useStandardFirmwareFlashPartModel(projectInfo, firmwareVariationId);

  return (
    <div css={style}>
      <div class="top-row">
        <div class="target-mcu-text">
          {targetDeviceType && `mcu: ${targetDeviceType}`}
        </div>
        <div class="how-to-reset">how to reset</div>
      </div>

      <div class="image-box">{svgImage_resetByHand}</div>
      <div class="text-part">
        {phase === 'WaitingReset' && <div>reset device to flash firmware</div>}

        {phase === 'WaitingUploadOrder' && detectedDeviceSig && (
          <div>
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
    </div>
  );
};

const style = css`
  > .top-row {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    > .how-to-reset {
      color: #999;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  > .image-box {
    margin: 20px 0;
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
    margin-top: 15px;
  }
`;
