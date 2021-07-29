import { jsx, css } from 'qx';
import { uiTheme } from '~/ui/base';
import { GlobalMenuPart, NavigationButtonsArea } from '~/ui/root/organisms';

export const NavigationColumn = () => {
  return (
    <div css={style}>
      <GlobalMenuPart />
      <NavigationButtonsArea />
    </div>
  );
};

const style = css`
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
