import { jsx, css } from 'qx';
import { uiTheme } from '~/ui/base';
import { GlobalMenuPart, NavigationButtonsArea } from '~/ui/root/organisms';

const cssNavigationColumn = css`
  width: 50px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
  background: ${uiTheme.colors.clNavigationColumn};
  > :not(:first-child) {
    margin-top: 20px;
  }
`;

export const NavigationColumn = () => {
  return (
    <div css={cssNavigationColumn}>
      <GlobalMenuPart />
      <NavigationButtonsArea />
    </div>
  );
};
