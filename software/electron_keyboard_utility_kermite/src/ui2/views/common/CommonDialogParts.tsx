import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';

export const CommonDialogFrame = (props: {
  caption?: string;
  children: any;
}) => {
  const cssLayerEditDialogPanel = css`
    background: #fff;
    border: solid 1px #ccc;
    min-width: 400px;
    min-height: 120px;
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
  `;
  return <div css={cssBody}>{props.children}</div>;
};

export const DialogButtonsRow = (props: { children: any }) => {
  const cssButtonsRow = css`
    margin: 0 15px 10px;
    display: flex;
    justify-content: flex-end;
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
    <button css={cssButton} onClick={props.onClick}>
      {props.children}
    </button>
  );
};
