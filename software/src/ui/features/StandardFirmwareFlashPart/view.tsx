import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { useStandardFirmwareFlashPartModel } from '~/ui/features/StandardFirmwareFlashPart/model';

export const StandardFirmwareFlashPart: FC = () => {
  const {
    phase,
    detectedDeviceSig,
    canFlashFirmwareToDetectedDevice,
    onWriteButton,
  } = useStandardFirmwareFlashPartModel();

  return (
    <div css={style}>
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
  );
};

const style = css`
  padding: 20px;
`;
