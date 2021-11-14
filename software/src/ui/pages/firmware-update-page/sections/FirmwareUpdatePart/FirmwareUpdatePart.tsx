import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { GeneralButton, GeneralSelector } from '~/ui/components';
import {
  PartBody,
  PartHeader,
} from '~/ui/pages/firmware-update-page/Components';
import { useFirmwareUpdatePartModel } from '~/ui/pages/firmware-update-page/sections/FirmwareUpdatePart/FirmwareUpdatePartModel';

export const FirmwareUpdatePart: FC = () => {
  const {
    phase,
    detectedDeviceSig,
    canSelectTargetFirmware,
    firmwareSelectorSource,
    canFlashSelectedFirmwareToDetectedDevice,
    onWriteButton,
    onResetButton,
    onLogButton,
  } = useFirmwareUpdatePartModel();

  return (
    <div css={style}>
      <PartHeader>{texts.label_device_firmwareUpdate_sectionTitle}</PartHeader>
      <PartBody className="part-body">
        <div className="operationAlert">
          {texts.label_device_firmwareUpdate_operationAlertText}
        </div>

        <div className="mainRow">
          <GeneralSelector
            {...firmwareSelectorSource}
            width={350}
            disabled={!canSelectTargetFirmware}
            hint={texts.label_device_firmwareUpdate_projectSelector}
          />
        </div>

        <div className="statusRow">
          {phase === 'WaitingReset' && (
            <div>{texts.label_device_firmwareUpdate_usageText}</div>
          )}

          {phase === 'WaitingUploadOrder' && detectedDeviceSig && (
            <div>
              <div>
                {texts.label_device_firmwareUpdate_deviceDetected.replace(
                  '{DEVICE_NAME}',
                  detectedDeviceSig,
                )}
              </div>
              {canFlashSelectedFirmwareToDetectedDevice && (
                <GeneralButton
                  onClick={onWriteButton}
                  text={texts.label_device_firmwareUpdate_writeButton}
                />
              )}
            </div>
          )}

          {phase === 'WaitingUploadOrder' &&
            detectedDeviceSig &&
            !canFlashSelectedFirmwareToDetectedDevice && (
              <div className="note">
                {firmwareSelectorSource.value
                  ? 'Selected firmware is not supposed to be flashed into this device.'
                  : 'Please select firmware.'}
              </div>
            )}

          {phase === 'Uploading' && (
            <div>
              <div>{texts.label_device_firmwareUpdate_writing}</div>
            </div>
          )}

          {phase === 'UploadSuccess' && (
            <div>
              <div>{texts.label_device_firmwareUpdate_success}</div>
              <GeneralButton
                onClick={onResetButton}
                text={texts.label_device_firmwareUpdate_doneButton}
              />
            </div>
          )}

          {phase === 'UploadFailure' && (
            <div>
              <span style={{ color: 'red' }}>
                {texts.label_device_firmwareUpdate_failure}
              </span>
              <GeneralButton
                onClick={onLogButton}
                text={texts.label_device_firmwareUpdate_logButton}
              />
              <GeneralButton
                onClick={onResetButton}
                text={texts.label_device_firmwareUpdate_doneButton}
              />
            </div>
          )}
        </div>
      </PartBody>
    </div>
  );
};

const style = css`
  > .part-body {
    > * + * {
      margin-top: 10px;
    }

    .operationAlert {
    }

    .mainRow {
      > * + * {
        margin-left: 5px;
      }
    }

    .statusRow {
      > div {
        display: flex;
        align-items: center;
        > * + * {
          margin-left: 10px;
        }
      }
    }

    button {
      padding: 0 5px;
    }

    .note {
      margin-top: 10px;
    }
  }
`;
