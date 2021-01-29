import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { GeneralSelector } from '~/ui-root/zones/common/parts/controls/GeneralSelector';
import { makeFirmwareUpdationPageViewModel } from '~/ui-root/zones/firmup/FirmwareUpdationPageViewModel';

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
            <button onClick={vm.onWriteButton}>write</button>
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
            <button onClick={vm.onResetButton}>done</button>
          </div>
        )}

        {phase === 'UploadFailure' && (
          <div>
            <span style={{ color: 'red' }}>Failure</span>
            <button onClick={vm.onLogButton}>log</button>
            <button onClick={vm.onResetButton}>done</button>
          </div>
        )}
      </div>
    </div>
  );
};
