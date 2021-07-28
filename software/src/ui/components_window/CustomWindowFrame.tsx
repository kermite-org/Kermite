import { jsx, css, QxNode } from 'qx';
import { uiTheme } from '~/ui/base';

export const CustomWindowFrame = (props: {
  children: QxNode;
  renderTitleBar: () => JSX.Element;
  renderStatusBar: () => JSX.Element;
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
    overflow: hidden;
    display: flex;
    flex-direction: column;
    > * {
      flex-grow: 1;
    }
  `;

  const cssStatusBar = css`
    flex-shrink: 0;
    height: 28px;
    background: ${uiTheme.colors.clWindowBar};
  `;

  return (
    <div css={cssRoot}>
      <div css={cssTitleBarRow}>{props.renderTitleBar()}</div>
      <div css={cssBodyRow}>{props.children}</div>
      <div css={cssStatusBar}>{props.renderStatusBar()}</div>
    </div>
  );
};
