import { css, FC, jsx } from 'qx';
import { GlobalHintDisplay } from '~/ui/facets';

export const WindowStatusBarSection: FC = () => (
  <div css={style}>
    <GlobalHintDisplay />
  </div>
);

const style = css`
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 4px;
`;
