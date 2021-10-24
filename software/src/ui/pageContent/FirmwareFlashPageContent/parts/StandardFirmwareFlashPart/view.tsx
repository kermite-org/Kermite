import { css, FC, jsx } from 'qx';
import { IProjectPackageInfo } from '~/shared';
import { texts } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { useStandardFirmwareFlashPartModel } from '~/ui/pageContent/FirmwareFlashPageContent/parts/StandardFirmwareFlashPart/model';

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
  } = useStandardFirmwareFlashPartModel(projectInfo, firmwareVariationId);

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
