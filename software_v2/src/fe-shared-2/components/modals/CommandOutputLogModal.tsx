import { css, jsx } from 'alumina';
import { createModal } from '../overlay';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogButton,
  DialogButtonsRow,
  DialogContentRow,
} from './CommonDialogParts';

export const showCommandOutputLogModal = createModal(
  (args: { caption: string; logText: string }) => {
    return (props: { close: () => void }) => {
      return (
        <ClosableOverlay close={props.close}>
          <CommonDialogFrame caption={args.caption}>
            <DialogContentRow>
              <div class={cssContentBody}>
                <pre class="logTextBox">{args.logText}</pre>
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

const cssContentBody = css`
  .logTextBox {
    border: solid 1px #888;
    height: 400px;
    overflow-y: scroll;
  }
`;
