import { css, FC, jsx } from 'qx';
import { texts, uiTheme } from '~/ui/base';
import { ClosableOverlay, GeneralButton } from '~/ui/components';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { useFirmwareFlashPanelModel } from '~/ui/features/ProjectQuickSetupPart/sections/FirmwareFlashPanel/model';

export const FirmwareFlashPanelImpl: FC = () => {
  const {
    phase,
    detectedDeviceSig,
    canFlashFirmwareToDetectedDevice,
    onWriteButton,
  } = useFirmwareFlashPanelModel();

  const {
    actions: { closeFirmwareFlashPanel },
  } = projectQuickSetupStore;

  return (
    <ClosableOverlay close={closeFirmwareFlashPanel}>
      <div css={panelStyle}>
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
    </ClosableOverlay>
  );
};

const panelStyle = css`
  padding: 20px;
  background: ${uiTheme.colors.clPageBackground};
  border: solid 1px ${uiTheme.colors.clPrimary};
`;

export const FirmwareFlashPanel: FC = () => {
  const { isFirmwareFlashPanelOpen } = projectQuickSetupStore.state;
  return <FirmwareFlashPanelImpl qxIf={isFirmwareFlashPanelOpen} />;
};
