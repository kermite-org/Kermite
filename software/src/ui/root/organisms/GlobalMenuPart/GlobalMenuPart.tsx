import { jsx, css, FC } from 'alumina';
import { texts, uiTheme } from '~/ui/base';
import { useGlobalMenuPartModel } from '~/ui/root/organisms/GlobalMenuPart/GlobalMenuPart.model';

export const GlobalMenuPart: FC = () => {
  const { isOpen, openMenu, closeMenu, menuItems } = useGlobalMenuPartModel();
  return (
    <div css={style}>
      <div class="overlay" if={isOpen} onClick={closeMenu} />
      <div class="menuArea">
        <div
          class="menuButton"
          onMouseDown={openMenu}
          data-hint={texts.globalMenuHint.globalMenuButton}
        >
          <i class="fa fa-bars" />
        </div>
        <div class="menuPopup" if={isOpen}>
          {menuItems.map((mi) => (
            <div key={mi.key} onMouseUp={mi.handler} data-hint={mi.hint}>
              {mi.active ? '✓' : ''} {mi.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const style = css`
  > .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 10;
  }

  > .menuArea {
    position: relative;

    > .menuButton {
      width: 20px;
      height: 20px;
      background: #888;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:hover {
        background: #8ac;
      }
      transition: ${uiTheme.commonTransitionSpec};
    }

    > .menuPopup {
      min-width: 200px;
      min-height: 100px;
      background: #fff;
      position: absolute;
      color: #000;
      z-index: 20;
      user-select: none;
      border: solid 1px #248;

      > div {
        padding: 4px;
        font-size: 13px;
        cursor: pointer;
        &:hover {
          background: #c0f0f8;
        }
        transition: ${uiTheme.commonTransitionSpec};
      }
    }
  }
`;
