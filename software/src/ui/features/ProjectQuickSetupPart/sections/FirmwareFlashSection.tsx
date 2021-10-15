import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { GeneralButton } from '~/ui/components';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { useFirmwareFlashSectionModel } from '~/ui/features/ProjectQuickSetupPart/sections/FirmwareFlashSection.model';

export const FirmwareFlashSection: FC = () => {
  const {
    phase,
    detectedDeviceSig,
    canFlashFirmwareToDetectedDevice,
    onWriteButton,
  } = useFirmwareFlashSectionModel();

  const {
    state: { isConfigValid },
  } = projectQuickSetupStore;

  return (
    <SectionFrame
      title="Firmware Upload"
      class={style}
      inactive={!isConfigValid}
    >
      <div>
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
    </SectionFrame>
  );
};

const style = css`
  height: 100%;
`;
