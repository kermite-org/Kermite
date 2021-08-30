import { useLocal } from 'qx';
import { texts, appUi } from '~/ui/base';
import {
  useThemeSelectionModel,
  useLanguageSelectionModel,
} from '~/ui/commonModels';
import { commitUiSettings, uiState } from '~/ui/commonStore';

export interface IGlobalMenuItem {
  key: string;
  text: string;
  handler: () => void;
  active: boolean;
  hint: string;
}

function createMenuItems(): IGlobalMenuItem[] {
  const { settings } = uiState;
  const themeSelectionModel = useThemeSelectionModel();
  const languageSelectionModel = useLanguageSelectionModel();

  const menuItems: IGlobalMenuItem[] = [
    {
      key: 'miShowInputArea',
      text: texts.label_globalMenu_showTestInputArea,
      handler() {
        commitUiSettings({ showTestInputArea: !settings.showTestInputArea });
      },
      active: settings.showTestInputArea,
      hint: texts.hint_globalMenu_showTestInputArea,
    },
    {
      key: 'miThemeLight',
      text: texts.label_globalMenu_theme_light,
      handler() {
        themeSelectionModel.changeTheme('light');
      },
      active: themeSelectionModel.currentThemeKey === 'light',
      hint: texts.hint_globalMenu_theme_light,
    },
    {
      key: 'miThemeDark',
      text: texts.label_globalMenu_theme_dark,
      handler() {
        themeSelectionModel.changeTheme('dark');
      },
      active: themeSelectionModel.currentThemeKey === 'dark',
      hint: texts.hint_globalMenu_theme_dark,
    },

    {
      key: 'miLanguageEnglish',
      text: texts.label_globalMenu_language_english,
      handler() {
        languageSelectionModel.changeLanguage('english');
      },
      active: languageSelectionModel.currentLanguage === 'english',
      hint: texts.hint_globalMenu_language_english,
    },
    {
      key: 'miLanguageJapanese',
      text: texts.label_globalMenu_language_japanese,
      handler() {
        languageSelectionModel.changeLanguage('japanese');
      },
      active: languageSelectionModel.currentLanguage === 'japanese',
      hint: texts.hint_globalMenu_language_japanese,
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
  const state = useLocal({ isOpen: false });
  return {
    isOpen: state.isOpen,
    openMenu: () => (state.isOpen = true),
    closeMenu: () => (state.isOpen = false),
    menuItems: createMenuItems(),
  };
}
