import { appUi } from '~ui/core';
import { uiStatusModel, themeSelectionModel } from '~ui/models';

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

interface IMenuItem {
  key: string;
  text: string;
  handler: () => void;
  active: boolean;
}

export function createMenuItems(): IMenuItem[] {
  const { settings } = uiStatusModel;

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
        themeSelectionModel.changeTheme('light');
      },
      active: themeSelectionModel.currentTheme === 'light'
    },
    {
      key: 'miThemeDark',
      text: 'Dark Theme',
      handler() {
        themeSelectionModel.changeTheme('dark');
      },
      active: themeSelectionModel.currentTheme === 'dark'
    }
  ];

  if (appUi.isDevelopment) {
    return menuItems;
  } else {
    return menuItems.filter((mi) => mi.key !== 'miShowShapePreview');
  }
}
