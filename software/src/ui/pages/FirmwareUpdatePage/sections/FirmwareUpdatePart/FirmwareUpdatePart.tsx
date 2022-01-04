import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { GeneralButton, GeneralSelector } from '~/ui/components';
import { PartBody, PartHeader } from '~/ui/pages/FirmwareUpdatePage/Components';
import { useFirmwareUpdatePartModel } from '~/ui/pages/FirmwareUpdatePage/sections/FirmwareUpdatePart/FirmwareUpdatePartModel';

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
      <PartHeader>{texts.deviceFirmwareUpdate.sectionTitle}</PartHeader>
      <PartBody class="part-body">
        <div class="operationAlert">
          {texts.deviceFirmwareUpdate.operationAlertText}
        </div>

        <div class="mainRow">
          <GeneralSelector
            {...firmwareSelectorSource}
            width={350}
            disabled={!canSelectTargetFirmware}
            hint={texts.deviceFirmwareUpdate.projectSelector}
          />
        </div>

        <div class="statusRow">
          {phase === 'WaitingReset' && (
            <div>{texts.deviceFirmwareUpdate.usageText}</div>
          )}

          {phase === 'WaitingUploadOrder' && detectedDeviceSig && (
            <div>
              <div>
                {texts.deviceFirmwareUpdate.deviceDetected.replace(
                  '{DEVICE_NAME}',
                  detectedDeviceSig,
                )}
              </div>
              {canFlashSelectedFirmwareToDetectedDevice && (
                <GeneralButton
                  onClick={onWriteButton}
                  text={texts.deviceFirmwareUpdate.writeButton}
                />
              )}
            </div>
          )}

          {phase === 'WaitingUploadOrder' &&
            detectedDeviceSig &&
            !canFlashSelectedFirmwareToDetectedDevice && (
              <div class="note">
                {firmwareSelectorSource.value
                  ? 'Selected firmware is not supposed to be flashed into this device.'
                  : 'Please select firmware.'}
              </div>
            )}

          {phase === 'Uploading' && (
            <div>
              <div>{texts.deviceFirmwareUpdate.writing}</div>
            </div>
          )}

          {phase === 'UploadSuccess' && (
            <div>
              <div>{texts.deviceFirmwareUpdate.success}</div>
              <GeneralButton
                onClick={onResetButton}
                text={texts.deviceFirmwareUpdate.doneButton}
              />
            </div>
          )}

          {phase === 'UploadFailure' && (
            <div>
              <span style={{ color: 'red' }}>
                {texts.deviceFirmwareUpdate.failure}
              </span>
              <GeneralButton
                onClick={onLogButton}
                text={texts.deviceFirmwareUpdate.logButton}
              />
              <GeneralButton
                onClick={onResetButton}
                text={texts.deviceFirmwareUpdate.doneButton}
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
