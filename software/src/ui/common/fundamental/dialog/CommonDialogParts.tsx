import { jsx, css } from 'qx';
import { useLocal } from '~/ui/common/helpers';

export function ClosableOverlay(props: {
  close: () => void;
  children: JSX.Element;
}) {
  const cssDiv = css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  `;

  const downMousePos = useLocal({ x: -1, y: -1 });

  const onMouseDown = (e: MouseEvent) => {
    downMousePos.x = e.pageX;
    downMousePos.y = e.pageY;
  };
  const onMouseUp = (e: MouseEvent) => {
    if (e.pageX === downMousePos.x && e.pageY === downMousePos.y) {
      props.close();
    }
    downMousePos.x = -1;
    downMousePos.y = -1;
  };

  const onMouseUpInner = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div css={cssDiv} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
      <div onMouseUp={onMouseUpInner}>{props.children}</div>
    </div>
  );
}

export const CommonDialogFrame = (props: {
  caption?: string;
  children: any;
  close?: () => void;
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
    justify-content: space-between;
    align-items: center;

    > .titleText {
      margin-left: 4px;
    }

    > .closeButton {
      cursor: pointer;
      padding: 0 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 24px;
    }
  `;

  const cssBody = css``;

  return (
    <div css={cssLayerEditDialogPanel}>
      <div css={cssTitleBar}>
        <span class="titleText">{props.caption}</span>
        <div class="closeButton" onClick={props.close} qxIf={!!props.close}>
          <i class="fa fa-times" />
        </div>
      </div>
      <div css={cssBody}>{props.children}</div>
    </div>
  );
};

export const DialogContentRow = (props: { children: any }) => {
  const cssBody = css`
    margin: 10px 15px 0;
    color: #048;
    min-height: 60px;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    word-break: break-all;
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

export const DialogButton = (props: {
  children: any;
  onClick: () => void;
  disabled?: boolean;
}) => {
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

    &:disabled {
      opacity: 0.4;
    }
  `;
  return (
    <button
      css={cssButton}
      onClick={props.onClick}
      data-debug="hoge"
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
