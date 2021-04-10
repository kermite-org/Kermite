import { css, Hook, jsx } from 'qx';
import { texts } from '~/ui-common';
import { GeneralButton, GeneralSelector } from '~/ui-common/components';
import { firmwareUpdationModel } from './FirmwareUpdationModel';
import { makeFirmwareUpdationPageViewModel } from './FirmwareUpdationPageViewModel';

const cssFirmwareUpdationPart = css`
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
`;

export const FirmwareUpdationPart = () => {
  Hook.useEffect(firmwareUpdationModel.startPageSession, []);

  const vm = makeFirmwareUpdationPageViewModel();
  const { phase } = vm;

  return (
    <div css={cssFirmwareUpdationPart}>
      <div className="titleRow">
        {texts.label_device_firmwareUpdation_sectionTitle}
      </div>

      <div className="operationAlert">
        {texts.label_deivce_firmwareUpdation_operationAlertText}
      </div>

      <div className="mainRow">
        <GeneralSelector
          {...vm.projectSelectorSource}
          width={350}
          disabled={!vm.canSelectTargetFirmware}
          hint={texts.label_device_firmwareUpdation_projectSelector}
        />
      </div>

      <div className="statusRow">
        {phase === 'WaitingReset' && (
          <div>{texts.label_device_firmwareUpdation_usageText}</div>
        )}

        {phase === 'WaitingUploadOrder' && vm.detectedDeviceSig && (
          <div>
            <div>
              {texts.label_device_firmwareUpdation_deviceDetected.replace(
                '{DEVICE_NAME}',
                vm.detectedDeviceSig,
              )}
            </div>
            <GeneralButton
              onClick={vm.onWriteButton}
              text={texts.label_device_firmwareUpdation_writeButton}
            />
          </div>
        )}

        {phase === 'Uploading' && (
          <div>
            <div>{texts.label_device_firmwareUpdation_writing}</div>
          </div>
        )}

        {phase === 'UploadSuccess' && (
          <div>
            <div>{texts.label_device_firmwareUpdation_success}</div>
            <GeneralButton
              onClick={vm.onResetButton}
              text={texts.label_device_firmwareUpdation_doneButton}
            />
          </div>
        )}

        {phase === 'UploadFailure' && (
          <div>
            <span style={{ color: 'red' }}>
              {texts.label_device_firmwareUpdation_failure}
            </span>
            <GeneralButton
              onClick={vm.onLogButton}
              text={texts.label_device_firmwareUpdation_logButton}
            />
            <GeneralButton
              onClick={vm.onResetButton}
              text={texts.label_device_firmwareUpdation_doneButton}
            />
          </div>
        )}
      </div>
    </div>
  );
};
