import { css } from 'goober';
import { h } from '~lib/qx';
import { models } from '~ui/models';
import { reflectValue } from '~ui/views/base/FormHelpers';
import { callErrorLogModal } from './ErrorLogModal';

export const FirmwareUpdationPage = () => {
  const cssBase = css`
    background: #fff;
    color: #444;
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

  const model = models.firmwareUpdationModel;

  let selectedFirmwareName = '';

  const setSelectedFirmwareName = (firmwareName: string) => {
    selectedFirmwareName = firmwareName;
  };

  const onWriteButton = () => {
    if (!selectedFirmwareName) {
      alert('please select the firmware');
      return;
    }
    model.uploadFirmware(selectedFirmwareName);
  };

  const onResetButton = () => {
    model.backToInitialPhase();
  };

  const onLogButton = () => {
    callErrorLogModal(model.firmwareUploadResult || '');
  };

  const didMount = () => {
    model.startComPortListener();
  };

  const willUnmount = () => {
    model.endComPortListener();
  };

  const render = () => {
    const { phase, firmwareNames } = model;
    const canSelectTargetFirmware =
      phase === 'WaitingReset' || phase === 'WaitingUploadOrder';

    return (
      <div css={cssBase}>
        <div className="titleRow">Firmware Updation</div>

        <div className="operationAlert">
          Note: Wrong firmware selection may damage the hardware. Be careful.
        </div>

        <div className="mainRow">
          <select
            disabled={!canSelectTargetFirmware}
            value={selectedFirmwareName}
            onChange={reflectValue(setSelectedFirmwareName)}
          >
            <option key="" value="">
              select firmware
            </option>
            {firmwareNames.map((firmwareName) => (
              <option key={firmwareName} value={firmwareName}>
                {firmwareName}
              </option>
            ))}
          </select>
        </div>

        <div className="statusRow">
          {phase === 'WaitingReset' && (
            <div>Double tap the reset button on the device.</div>
          )}

          {phase === 'WaitingUploadOrder' && (
            <div>
              <div>{model.comPortName} detected. Ready to flash.</div>
              <button onClick={onWriteButton}>write</button>
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
              <button onClick={onResetButton}>done</button>
            </div>
          )}

          {phase === 'UploadFailure' && (
            <div>
              <span style={{ color: 'red' }}>Failure</span>
              <button onClick={onLogButton}>log</button>
              <button onClick={onResetButton}>done</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return {
    didMount,
    willUnmount,
    render
  };
};
