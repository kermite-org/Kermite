import { css } from 'goober';
import { uiTheme } from '~ui/core';
import { GlobalMenuPart } from './GlobalMenuPart';
import { NavigationButtonsArea } from './NavigationButtonsArea';
import { h } from '~qx';

const cssNavigationColumn = css`
  width: 50px;
  flex-shrink: 0;
  background: ${uiTheme.colors.clNavigationColumn};
  padding: 10px;
`;

export const NavigationColumn = () => {
  return (
    <div css={cssNavigationColumn}>
      <GlobalMenuPart />
      <NavigationButtonsArea />
    </div>
  );
};
