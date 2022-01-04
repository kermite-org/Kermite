import { css, FC, jsx, AluminaNode } from 'alumina';

type Props = {
  children: AluminaNode;
};

export const WidgetWindowFrame: FC<Props> = ({ children }) => (
  <div css={style}>
    <div class="inner">{children}</div>
  </div>
);

const style = css`
  user-select: none;
  width: 100%;
  height: 100%;
  padding: 6px;

  > .inner {
    position: relative;
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;
  }
`;
