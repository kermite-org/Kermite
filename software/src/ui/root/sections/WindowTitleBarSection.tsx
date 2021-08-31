import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';
import { WindowTitlePart } from '~/ui/components';
import { WindowControlButtonsPart } from '~/ui/facets';

export const WindowTitleBarSection: FC = () => (
  <div css={style}>
    <WindowTitlePart />
    <WindowControlButtonsPart />
  </div>
);

const style = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  background: ${uiTheme.colors.clWindowBar};
`;
