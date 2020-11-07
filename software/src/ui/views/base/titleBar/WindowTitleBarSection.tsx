import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { TitleBarViewModel } from '~ui/viewModels/TitleBarViewModel';
import { WindowControlButtonsPart } from './WindowControlButtonsPart';
import { WindowTitlePart } from './WindowTitlePart';

export const WindowTitleBarSection = ({ vm }: { vm: TitleBarViewModel }) => {
  const cssTitleBarDiv = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    -webkit-app-region: drag;
    background: ${uiTheme.colors.clTitleBar};
  `;

  return (
    <div css={cssTitleBarDiv}>
      <WindowTitlePart />
      <WindowControlButtonsPart vm={vm} />
    </div>
  );
};
