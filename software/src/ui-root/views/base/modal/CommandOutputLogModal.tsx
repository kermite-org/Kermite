import { css } from 'goober';
import { h } from 'qx';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogContentRow,
  DialogButtonsRow,
  DialogButton,
} from '~/ui-common/fundamental/dialog/CommonDialogParts';
import { createModal } from '~/ui-common/fundamental/overlay/ForegroundModalLayer';

export const showCommandOutputLogModal = createModal(
  (args: { caption: string; logText: string }) => {
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
          <CommonDialogFrame caption={args.caption}>
            <DialogContentRow>
              <div css={cssContentBody}>
                <pre className="logTextBox">{args.logText}</pre>
              </div>
              <DialogButtonsRow>
                <DialogButton onClick={props.close}>close</DialogButton>
              </DialogButtonsRow>
            </DialogContentRow>
          </CommonDialogFrame>
        </ClosableOverlay>
      );
    };
  },
);
