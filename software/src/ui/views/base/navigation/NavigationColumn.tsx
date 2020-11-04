import { css } from 'goober';
import { h } from '~lib/qx';
import { uiTheme } from '~ui/core';
import { ViewModels } from '~ui/viewModels';
import { GlobalMenuPart } from './GlobalMenuPart';
import { NavigationButtonsArea } from './NavigationButtonsArea';

export const NavigationColumn = ({ vm }: { vm: ViewModels }) => {
  const cssNavigationColumn = css`
    width: 50px;
    flex-shrink: 0;
    background: ${uiTheme.colors.clNavigationColumn};
    padding: 10px;
  `;

  return (
    <div css={cssNavigationColumn}>
      <GlobalMenuPart vm={vm.globalMenu} />
      <NavigationButtonsArea vm={vm.navigation} />
    </div>
  );
};
