import { css } from 'goober';
import { h } from 'qx';

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

export const CommonDialogFrame = (props: {
  caption?: string;
  children: any;
}) => {
  const cssLayerEditDialogPanel = css`
    background: #fff;
    border: solid 1px #ccc;
    min-width: 400px;
    /* min-height: 120px; */
    border-radius: 4px;
    overflow: hidden;
    border: solid 2px #8af;
  `;

  const cssTitleBar = css`
    background: #8af;
    color: #fff;
    height: 28px;
    display: flex;
    align-items: center;
    padding-left: 4px;
  `;

  const cssBody = css``;

  return (
    <div css={cssLayerEditDialogPanel} onClick={(e) => e.stopPropagation()}>
      <div css={cssTitleBar}>{props.caption}</div>
      <div css={cssBody}>{props.children}</div>
    </div>
  );
};

export const DialogContentRow = (props: { children: any }) => {
  const cssBody = css`
    margin: 10px 15px 0;
    color: #048;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    white-space: pre-wrap;
  `;
  return <div css={cssBody}>{props.children}</div>;
};

export const DialogButtonsRow = (props: { children: any }) => {
  const cssButtonsRow = css`
    margin: 10px 15px;
    display: flex;
    justify-content: flex-end;
    > * + * {
      margin-left: 10px;
    }
  `;
  return <div css={cssButtonsRow}>{props.children}</div>;
};

export const DialogButton = (props: { children: any; onClick: () => void }) => {
  const cssButton = css`
    min-width: 80px;
    height: 28px;
    font-size: 16px;
    padding: 0 4px;
    border: solid 1px #08f;
    cursor: pointer;
    background: #8af;
    color: #048;

    &:hover {
      opacity: 0.8;
    }
  `;
  return (
    <button css={cssButton} onClick={props.onClick} data-debug="hoge">
      {props.children}
    </button>
  );
};
