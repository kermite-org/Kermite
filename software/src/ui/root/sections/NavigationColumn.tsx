import { jsx, css, FC } from 'qx';
import { uiTheme } from '~/ui/base';
import { GlobalMenuPart, NavigationButtonsArea } from '~/ui/root/organisms';

type Props = {
  disabled?: boolean;
};

export const NavigationColumn: FC<Props> = ({ disabled }) => (
  <div css={style} className={disabled && '--disabled'}>
    <div className="base">
      <GlobalMenuPart />
      <NavigationButtonsArea className="buttons-area" />
    </div>
    <div className="cover" />
  </div>
);

const style = css`
  width: 50px;
  flex-shrink: 0;
  position: relative;
  background: ${uiTheme.colors.clNavigationColumn};

  > .base {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10px;

    > .buttons-area {
      margin-top: 20px;
    }
  }

  &.--disabled > .base {
    opacity: 0.4;
  }

  &.--disabled > .cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    transition: all 0.3s;
  }
`;
