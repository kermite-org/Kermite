import { jsx, css, QxNode, FC } from 'qx';
import { uiTheme } from '~/ui/base';

type Props = {
  children: QxNode;
  renderTitleBar: FC;
  renderStatusBar: FC;
};

export const CustomWindowFrame: FC<Props> = ({
  renderTitleBar,
  renderStatusBar,
  children,
}) => (
  <div css={style}>
    <div class="title-bar">{renderTitleBar({})}</div>
    <div class="body-row">{children}</div>
    <div class="status-bar">{renderStatusBar({})}</div>
  </div>
);

const style = css`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  > .title-bar {
    flex-shrink: 0;
  }

  > .body-row {
    flex-grow: 1;
    overflow: hidden;
  }

  > .status-bar {
    flex-shrink: 0;
    height: 28px;
    background: ${uiTheme.colors.clWindowBar};
  }
`;
