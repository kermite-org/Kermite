import { jsx, css } from 'alumina';
import {
  ClosableOverlay,
  CommonDialogFrame,
  DialogButton,
  DialogButtonsRow,
  DialogContentRow,
} from '~/ui/components/modals/CommonDialogParts';
import { createModal } from '~/ui/components/overlay';

export const showCommandOutputLogModal = createModal(
  (args: { caption: string; logText: string }) => {
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

const cssContentBody = css`
  .logTextBox {
    border: solid 1px #888;
    height: 400px;
    overflow-y: scroll;
  }
`;
