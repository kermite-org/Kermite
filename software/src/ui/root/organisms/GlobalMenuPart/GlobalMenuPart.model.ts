import { useLocal } from 'alumina';
import { texts, appUi } from '~/ui/base';
import {
  useThemeSelectionModel,
  useLanguageSelectionModel,
} from '~/ui/commonModels';

export interface IGlobalMenuItem {
  key: string;
  text: string;
  handler: () => void;
  active: boolean;
  hint: string;
}

export interface IGlobalMenuModel {
  isOpen: boolean;
  openMenu(): void;
  closeMenu(): void;
  menuItems: IGlobalMenuItem[];
}

function createMenuItems(): IGlobalMenuItem[] {
  const themeSelectionModel = useThemeSelectionModel();
  const languageSelectionModel = useLanguageSelectionModel();
  const menuItems: IGlobalMenuItem[] = [
    {
      key: 'miThemeLight',
      text: texts.globalMenu.theme_light,
      handler() {
        themeSelectionModel.changeTheme('light');
      },
      active: themeSelectionModel.currentThemeKey === 'light',
      hint: texts.globalMenuHint.theme_light,
    },
    {
      key: 'miThemeDark',
      text: texts.globalMenu.theme_dark,
      handler() {
        themeSelectionModel.changeTheme('dark');
      },
      active: themeSelectionModel.currentThemeKey === 'dark',
      hint: texts.globalMenuHint.theme_dark,
    },

    {
      key: 'miLanguageEnglish',
      text: texts.globalMenu.language_english,
      handler() {
        languageSelectionModel.changeLanguage('english');
      },
      active: languageSelectionModel.currentLanguage === 'english',
      hint: texts.globalMenuHint.language_english,
    },
    {
      key: 'miLanguageJapanese',
      text: texts.globalMenu.language_japanese,
      handler() {
        languageSelectionModel.changeLanguage('japanese');
      },
      active: languageSelectionModel.currentLanguage === 'japanese',
      hint: texts.globalMenuHint.language_japanese,
    },
  ];

  if (appUi.isDevelopment) {
    return menuItems;
  } else {
    return menuItems.filter((mi) => mi.key !== 'miShowShapePreview');
  }
}

export function useGlobalMenuPartModel(): IGlobalMenuModel {
  const state = useLocal({ isOpen: false });
  return {
    isOpen: state.isOpen,
    openMenu: () => (state.isOpen = true),
    closeMenu: () => (state.isOpen = false),
    menuItems: createMenuItems(),
  };
}
