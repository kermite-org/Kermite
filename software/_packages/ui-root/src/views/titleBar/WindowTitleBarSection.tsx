import { uiTheme } from '~/ui-common';
import { css } from 'goober';
import { h } from 'qx';
import { WindowControlButtonsPart } from '~/views/titleBar/WindowControlButtonsPart';
import { WindowTitlePart } from '~/views/titleBar/elements/WindowTitlePart';

const cssWindowTitleBarSection = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  background: ${uiTheme.colors.clTitleBar};
`;

export const WindowTitleBarSection = () => {
  return (
    <div css={cssWindowTitleBarSection}>
      <WindowTitlePart />
      <WindowControlButtonsPart />
    </div>
  );
};
