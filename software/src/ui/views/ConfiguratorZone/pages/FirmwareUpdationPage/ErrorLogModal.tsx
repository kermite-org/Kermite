import { css } from 'goober';
import { h } from '~lib/qx';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogButton,
  DialogButtonsRow,
  DialogContentRow
} from '~ui/views/base/dialog/CommonDialogParts';
import { createModal } from '~ui/views/base/layout/ForegroundModalLayer';

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
