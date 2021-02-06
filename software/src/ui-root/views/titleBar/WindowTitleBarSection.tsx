import { css } from 'goober';
import { h } from 'qx';
import { uiTheme } from '~/ui-common';
import { WindowControlButtonsPart } from './WindowControlButtonsPart';
import { WindowTitlePart } from './elements/WindowTitlePart';

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
