import { css } from 'goober';
import { h, Hook } from 'qx';
import { uiTheme } from '~/ui-common';
import { GeneralButton, GeneralSelector } from '~/ui-common/components';
import { firmwareUpdationModel } from './FirmwareUpdationModel';
import { makeFirmwareUpdationPageViewModel } from './FirmwareUpdationPageViewModel';

const cssFirmwareUpdationPage = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 10px;

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

export const FirmwareUpdationPage = () => {
  Hook.useEffect(firmwareUpdationModel.startPageSession, []);

  const vm = makeFirmwareUpdationPageViewModel();
  const { phase } = vm;

  return (
    <div css={cssFirmwareUpdationPage}>
      <div className="titleRow">Firmware Updation</div>

      <div className="operationAlert">
        Note: Wrong firmware selection may damage the hardware. Be careful.
      </div>

      <div className="mainRow">
        <GeneralSelector
          {...vm.projectSelectorSource}
          width={170}
          disabled={!vm.canSelectTargetFirmware}
        />
      </div>

      <div className="statusRow">
        {phase === 'WaitingReset' && (
          <div>Double tap the reset button on the device.</div>
        )}

        {phase === 'WaitingUploadOrder' && (
          <div>
            <div>{vm.comPortName} detected. Ready to flash.</div>
            <GeneralButton onClick={vm.onWriteButton} text="write" />
          </div>
        )}

        {phase === 'Uploading' && (
          <div>
            <div>Uploading...</div>
          </div>
        )}

        {phase === 'UploadSuccess' && (
          <div>
            <div>Success!</div>
            <GeneralButton onClick={vm.onResetButton} text="done" />
          </div>
        )}

        {phase === 'UploadFailure' && (
          <div>
            <span style={{ color: 'red' }}>Failure</span>
            <GeneralButton onClick={vm.onLogButton} text="log" />
            <GeneralButton onClick={vm.onResetButton} text="done" />
          </div>
        )}
      </div>
    </div>
  );
};
