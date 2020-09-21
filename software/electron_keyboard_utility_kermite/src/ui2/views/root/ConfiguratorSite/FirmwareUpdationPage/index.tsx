import { css } from 'goober';
import { appDomain } from '~ui2/models/zAppDomain';
import { createModal } from '~ui2/views/basis/ForegroundModalLayer';
import { h } from '~ui2/views/basis/qx';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogButton,
  DialogButtonsRow,
  DialogContentRow
} from '~ui2/views/common/CommonDialogParts';
import { reflectValue } from '~ui2/views/common/FormHelpers';

export const callErrorLogModal = createModal((logText: string) => {
  const cssContentBody = css`
    .logTextBox {
      border: solid 1px #888;
      height: 400px;
      overflow-y: scroll;
    }
  `;
  return (props: { close: () => void }) => {
    return (
      <ClosableOverlay close={props.close}>
        <CommonDialogFrame caption={'Operation Command Log'}>
          <DialogContentRow>
            <div css={cssContentBody}>
              <pre className="logTextBox">{logText}</pre>
            </div>
            <DialogButtonsRow>
              <DialogButton onClick={props.close}>close</DialogButton>
            </DialogButtonsRow>
          </DialogContentRow>
        </CommonDialogFrame>
      </ClosableOverlay>
    );
  };
});

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

  const model = appDomain.firmwareUpdationModel;

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
