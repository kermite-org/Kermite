import { Hook } from 'qx';
import { appUi } from '~/ui-common';
import { models } from '~/ui-root/models';

export interface IGlobalMenuItem {
  key: string;
  text: string;
  handler: () => void;
  active: boolean;
}

function createMenuItems(): IGlobalMenuItem[] {
  const { settings } = models.uiStatusModel;

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
        models.themeSelectionModel.changeTheme('light');
      },
      active: models.themeSelectionModel.currentTheme === 'light',
    },
    {
      key: 'miThemeDark',
      text: 'Dark Theme',
      handler() {
        models.themeSelectionModel.changeTheme('dark');
      },
      active: models.themeSelectionModel.currentTheme === 'dark',
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
