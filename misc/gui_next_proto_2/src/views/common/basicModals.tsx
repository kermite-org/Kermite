import { css } from 'goober';
import { hx } from '~views/basis/qx';
import { createModal } from '~views/basis/ForegroundModalLayer';

export function ClosableOverlay(props: {
  close: () => void;
  children: JSX.Element;
}) {
  const cssDiv = css`
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
  `;
  return (
    <div onClick={props.close} css={cssDiv}>
      {props.children}
    </div>
  );
}

const cssCommonModalPanel = css`
  background: #fff;
  border: solid 1px #ccc;
  width: 300px;
  height: 150px;
  display: flex;
  flex-direction: column;

  .main-row {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .buttons-row {
    flex-grow: 0;
    padding: 5px;
    display: flex;
    justify-content: flex-end;
  }

  button {
    padding: 0 4px;
    border: solid 1px #08f;
  }
`;

export const modalAlert = createModal((message: string) => {
  return (props: { close: () => void }) => {
    return (
      <ClosableOverlay close={props.close}>
        <div css={cssCommonModalPanel} onClick={(e) => e.stopPropagation()}>
          <div className="main-row">{message}</div>
          <div className="buttons-row">
            <button onClick={props.close}>OK</button>
          </div>
        </div>
      </ClosableOverlay>
    );
  };
});

export const modalConfirm = createModal((message: string) => {
  return (props: { close: (result: boolean) => void }) => {
    return (
      <ClosableOverlay close={() => props.close(false)}>
        <div css={cssCommonModalPanel} onClick={(e) => e.stopPropagation()}>
          <div className="main-row">{message}</div>
          <div className="buttons-row">
            <button onClick={() => props.close(false)}>cancel</button>
            <button onClick={() => props.close(true)}>OK</button>
          </div>
        </div>
      </ClosableOverlay>
    );
  };
});

export const modalTextInput = createModal(
  (args: { message: string; defaultText?: string }) => {
    const { message, defaultText } = args;
    let editText = defaultText || '';
    return (props: { close: (result: string | undefined) => void }) => {
      const onTextChange = (e: Event) => {
        editText = (e.target as HTMLInputElement).value;
      };

      return (
        <ClosableOverlay close={() => props.close(undefined)}>
          <div css={cssCommonModalPanel} onClick={(e) => e.stopPropagation()}>
            <div className="main-row">{message}</div>
            <div>
              <input type="text" value={editText} onChange={onTextChange} />
            </div>
            <div className="buttons-row">
              <button onClick={() => props.close(editText)}>OK</button>
            </div>
          </div>
        </ClosableOverlay>
      );
    };
  }
);
