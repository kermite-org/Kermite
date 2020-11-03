import { appUi } from '~ui/core';
import { Models } from '~ui/models';

interface IMenuItem {
  key: string;
  text: string;
  handler: () => void;
  active: boolean;
}

function createMenuItems(models: Models): IMenuItem[] {
  const { settings } = models.uiStatusModel;

  const menuItems: IMenuItem[] = [
    {
      key: 'miShowInputArea',
      text: 'Show test input area',
      handler() {
        settings.showTestInputArea = !settings.showTestInputArea;
      },
      active: settings.showTestInputArea
    },
    {
      key: 'miThemeLight',
      text: 'Light Theme',
      handler() {
        models.themeSelectionModel.changeTheme('light');
      },
      active: models.themeSelectionModel.currentTheme === 'light'
    },
    {
      key: 'miThemeDark',
      text: 'Dark Theme',
      handler() {
        models.themeSelectionModel.changeTheme('dark');
      },
      active: models.themeSelectionModel.currentTheme === 'dark'
    }
  ];

  if (appUi.isDevelopment) {
    return menuItems;
  } else {
    return menuItems.filter((mi) => mi.key !== 'miShowShapePreview');
  }
}

export class GlobalMenuViewModel {
  isOpen: boolean = false;

  constructor(private models: Models) {}

  openMenu = () => {
    this.isOpen = true;
  };

  closeMenu = () => {
    this.isOpen = false;
  };

  get menuItems() {
    return createMenuItems(this.models);
  }
}
