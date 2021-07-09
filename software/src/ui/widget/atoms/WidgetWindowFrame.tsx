import { css, FC, jsx } from 'qx';

type Props = {
  children: JSX.Element;
};

export const WidgetWindowFrame: FC<Props> = ({ children }) => (
  <div css={style}>
    <div className="inner">{children}</div>
  </div>
);

const style = css`
  user-select: none;
  width: 100%;
  height: 100%;
  padding: 4px;

  > .inner {
    position: relative;
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;
  }
`;
