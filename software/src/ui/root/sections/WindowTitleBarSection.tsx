import { jsx, css } from 'qx';
import { uiTheme } from '~/ui/base';
import { WindowTitlePart } from '~/ui/components';
import { WindowControlButtonsPart } from '~/ui/root/organisms';

const cssWindowTitleBarSection = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  background: ${uiTheme.colors.clWindowBar};
`;

export const WindowTitleBarSection = () => {
  return (
    <div css={cssWindowTitleBarSection}>
      <WindowTitlePart />
      <WindowControlButtonsPart />
    </div>
  );
};
