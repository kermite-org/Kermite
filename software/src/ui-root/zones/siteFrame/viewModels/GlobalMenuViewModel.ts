import { Hook } from 'qx';
import { appUi } from '~/ui-common';
import { uiStatusModel } from '~/ui-root/zones/common/commonModels/UiStatusModel';
import { themeSelectionModel } from '~/ui-root/zones/siteFrame/models/ThemeSelectionModel';

export interface IGlobalMenuItem {
  key: string;
  text: string;
  handler: () => void;
  active: boolean;
}

function createMenuItems(): IGlobalMenuItem[] {
  const { settings } = uiStatusModel;

  const menuItems: IGlobalMenuItem[] = [
    {
      key: 'miShowInputArea',
      text: 'Show test input area',
      handler() {
        settings.showTestInputArea = !settings.showTestInputArea;
      },
      active: settings.showTestInputArea,
    },
    {
      key: 'miThemeLight',
      text: 'Light Theme',
      handler() {
        themeSelectionModel.changeTheme('light');
      },
      active: themeSelectionModel.currentTheme === 'light',
    },
    {
      key: 'miThemeDark',
      text: 'Dark Theme',
      handler() {
        themeSelectionModel.changeTheme('dark');
      },
      active: themeSelectionModel.currentTheme === 'dark',
    },
  ];

  if (appUi.isDevelopment) {
    return menuItems;
  } else {
    return menuItems.filter((mi) => mi.key !== 'miShowShapePreview');
  }
}

export interface IGlobalMenuViewModel {
  isOpen: boolean;
  openMenu(): void;
  closeMenu(): void;
  menuItems: IGlobalMenuItem[];
}

export function makeGlobalMenuViewModel(): IGlobalMenuViewModel {
  const state = Hook.useMemo(() => ({ isOpen: false }), []);
  return {
    isOpen: state.isOpen,
    openMenu: () => (state.isOpen = true),
    closeMenu: () => (state.isOpen = false),
    menuItems: createMenuItems(),
  };
}
