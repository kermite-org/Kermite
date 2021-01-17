import { uiTheme } from '~/ui-common';
import { css } from 'goober';
import { h } from 'qx';
import { GlobalMenuPart } from '~/views/navigation/GlobalMenuPart';
import { NavigationButtonsArea } from '~/views/navigation/NavigationButtonsArea';

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
