import { uiTheme } from '@ui-common';
import { css } from 'goober';
import { h } from 'qx';
import { makeTitleBarViewModel } from '@ui-root/viewModels/TitleBarViewModel';
import { WindowControlButtonsPart } from './WindowControlButtonsPart';
import { WindowTitlePart } from './WindowTitlePart';

const cssWindowTitleBarSection = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  background: ${uiTheme.colors.clTitleBar};
`;

export const WindowTitleBarSection = () => {
  const vm = makeTitleBarViewModel();
  return (
    <div css={cssWindowTitleBarSection}>
      <WindowTitlePart />
      <WindowControlButtonsPart vm={vm} />
    </div>
  );
};
