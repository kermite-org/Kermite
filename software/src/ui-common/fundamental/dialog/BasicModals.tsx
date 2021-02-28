import { h, css } from 'qx';
import { reflectFieldValue } from '~/ui-common';
import { createModal } from '../overlay/ForegroundModalLayer';
import {
  CommonDialogFrame,
  ClosableOverlay,
  DialogContentRow,
  DialogButtonsRow,
  DialogButton,
} from './CommonDialogParts';

export const modalAlert = createModal((message: string) => {
  return (props: { close: () => void }) => {
    const { close } = props;
    return (
      <ClosableOverlay close={close}>
        <CommonDialogFrame caption="Alert">
          <DialogContentRow>{message}</DialogContentRow>
          <DialogButtonsRow>
            <DialogButton onClick={close}>OK</DialogButton>
          </DialogButtonsRow>
        </CommonDialogFrame>
      </ClosableOverlay>
    );
  };
});

export const modalError = createModal((message: string) => {
  return (props: { close: () => void }) => {
    const { close } = props;
    return (
      <ClosableOverlay close={close}>
        <CommonDialogFrame caption="Error">
          <DialogContentRow>{message}</DialogContentRow>
          <DialogButtonsRow>
            <DialogButton onClick={close}>OK</DialogButton>
          </DialogButtonsRow>
        </CommonDialogFrame>
      </ClosableOverlay>
    );
  };
});

export const modalConfirm = createModal(
  (args: { message: string; caption: string }) => {
    const { message, caption } = args;
    return (props: { close: (result: boolean) => void }) => {
      const submit = () => props.close(true);
      const close = () => props.close(false);
      return (
        <ClosableOverlay close={close}>
          <CommonDialogFrame caption={caption} close={close}>
            <DialogContentRow>{message}</DialogContentRow>
            <DialogButtonsRow>
              {/* <DialogButton onClick={close}>cancel</DialogButton> */}
              <DialogButton onClick={submit}>OK</DialogButton>
            </DialogButtonsRow>
          </CommonDialogFrame>
        </ClosableOverlay>
      );
    };
  },
);

export const modalTextEdit = createModal(
  (args: { message: string; defaultText?: string; caption: string }) => {
    const { message, defaultText, caption } = args;
    const editValues = {
      text: defaultText || '',
    };
    return (props: { close: (result: string | undefined) => void }) => {
      const close = () => props.close(undefined);
      const submit = () => props.close(editValues.text);

      const cssInputRow = css`
        margin-top: 5px;
      `;

      const cssCommonTextInput = css`
        width: 100%;
        height: 26px;
        font-size: 14px;
        padding-left: 4px;
      `;

      return (
        <ClosableOverlay close={close}>
          <CommonDialogFrame caption={caption} close={close}>
            <DialogContentRow>
              <div>{message}</div>
              <div css={cssInputRow}>
                <input
                  type="text"
                  css={cssCommonTextInput}
                  value={editValues.text}
                  onChange={reflectFieldValue(editValues, 'text')}
                />
              </div>
            </DialogContentRow>
            <DialogButtonsRow>
              <DialogButton onClick={submit}>OK</DialogButton>
            </DialogButtonsRow>
          </CommonDialogFrame>
        </ClosableOverlay>
      );
    };
  },
);
