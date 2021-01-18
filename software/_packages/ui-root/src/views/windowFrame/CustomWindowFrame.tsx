import { uiTheme } from '~/ui-common';
import { css } from 'goober';
import { h } from 'qx';

export const CustomWindowFrame = (props: {
  children: JSX.Element;
  renderTitleBar: () => JSX.Element;
}) => {
  const cssRoot = css`
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  const cssTitleBarRow = css`
    flex-shrink: 0;
  `;

  const cssBodyRow = css`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    > * {
      flex-grow: 1;
    }
  `;

  const cssStatusBar = css`
    background: ${uiTheme.colors.clStatusBar};
    height: 28px;
    flex-shrink: 0;
  `;

  return (
    <div css={cssRoot}>
      <div css={cssTitleBarRow}>{props.renderTitleBar()}</div>
      <div css={cssBodyRow}>{props.children}</div>
      <div css={cssStatusBar} />
    </div>
  );
};
