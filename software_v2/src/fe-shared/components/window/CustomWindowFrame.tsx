import { jsx, css, AluminaNode, FC } from 'alumina';
import { colors } from '~/app-shared';

type Props = {
  children: AluminaNode;
  renderTitleBar: FC;
  renderStatusBar: FC;
};

export const CustomWindowFrame: FC<Props> = ({
  renderTitleBar,
  renderStatusBar,
  children,
}) => (
  <div class={style}>
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
    background: ${colors.clWindowBar};
  }
`;
