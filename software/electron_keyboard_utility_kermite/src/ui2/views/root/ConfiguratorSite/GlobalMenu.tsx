import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { appDomain, siteModel } from '~ui2/models/zAppDomain';

export function makeGlobalMenuModel() {
  const self = {
    isOpen: false,
    openMenu() {
      self.isOpen = true;
    },
    closeMenu() {
      self.isOpen = false;
    }
  };
  return self;
}

const cssBase = css``;

const cssOverlay = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const cssMenuArea = css`
  position: relative;
`;

const cssMenuButton = css`
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
`;

const cssMenuPopup = css`
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
  }
`;

interface IMenuItem {
  key: string;
  text: string;
  handler: () => void;
  active: boolean;
}

function createMenuItems(): IMenuItem[] {
  const {
    uiStatusModel: { settings }
  } = appDomain;

  const menuItems: IMenuItem[] = [
    {
      key: 'miShowInputArea',
      text: 'Show test input area',
      handler() {
        settings.showTestInputArea = !settings.showTestInputArea;
      },
      active: settings.showTestInputArea
    },
    // {
    //   key: 'miShowShapePreview',
    //   text: 'Show shape preview page',
    //   handler() {
    //     if (settings.page !== 'shapePreview') {
    //       settings.page = 'shapePreview';
    //     } else {
    //       settings.page = 'editor';
    //     }
    //   },
    //   active: settings.page === 'shapePreview'
    // },
    {
      key: 'miThemeLight',
      text: 'Light Theme',
      handler() {
        appDomain.themeSelectionModel.changeTheme('light');
      },
      active: appDomain.themeSelectionModel.currentTheme === 'light'
    },
    {
      key: 'miThemeDark',
      text: 'Dark Theme',
      handler() {
        appDomain.themeSelectionModel.changeTheme('dark');
      },
      active: appDomain.themeSelectionModel.currentTheme === 'dark'
    }
  ];

  if (siteModel.isDevelopment) {
    return menuItems;
  } else {
    return menuItems.filter((mi) => mi.key !== 'miShowShapePreview');
  }
}

export const GlobalMenuPart = () => {
  const menuModel = makeGlobalMenuModel();

  return () => {
    const { isOpen, openMenu, closeMenu } = menuModel;

    const menuItems = createMenuItems();
    return (
      <div css={cssBase}>
        <div css={cssOverlay} qxIf={isOpen} onClick={closeMenu} />
        <div css={cssMenuArea}>
          <div css={cssMenuButton} onMouseDown={openMenu}>
            <i className="fa fa-bars" />
          </div>
          <div css={cssMenuPopup} qxIf={isOpen}>
            {menuItems.map((mi) => (
              <div key={mi.key} onMouseUp={mi.handler}>
                {mi.active ? '✓' : ''} {mi.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
};
