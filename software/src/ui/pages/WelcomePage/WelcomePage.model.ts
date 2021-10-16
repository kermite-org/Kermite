import {
  useLanguageSelectionModel,
  useThemeSelectionModel,
} from '~/ui/commonModels';
import { uiActions, uiReaders, uiState } from '~/ui/store';

interface WelcomePageModel {
  appVersion: string;
  isLanguageEnglish: boolean;
  setLanguageEnglish(): void;
  isLanguageJapanese: boolean;
  setLanguageJapanese(): void;
  openSetupNavigationPanel(): void;
  isDarkTheme: boolean;
  setDarkTheme(isDark: boolean): void;
  showProjectQuickSetupPage(): void;
  isDeveloperMode: boolean;
}

export function useWelcomePageModel(): WelcomePageModel {
  const appVersion = uiState.core.applicationVersionInfo.version;
  const { currentLanguage, changeLanguage } = useLanguageSelectionModel();
  const { currentThemeKey, changeTheme } = useThemeSelectionModel();

  const isLanguageEnglish = currentLanguage === 'english';
  const setLanguageEnglish = () => changeLanguage('english');
  const isLanguageJapanese = currentLanguage === 'japanese';
  const setLanguageJapanese = () => changeLanguage('japanese');

  const { openSetupNavigationPanel } = uiActions;
  const showProjectQuickSetupPage = () =>
    uiActions.navigateTo({ type: 'projectQuickSetup' });

  const isDarkTheme = currentThemeKey === 'dark';
  const setDarkTheme = (isDark: boolean) =>
    changeTheme(isDark ? 'dark' : 'light');

  const { isDeveloperMode } = uiReaders;

  return {
    appVersion,
    isLanguageEnglish,
    setLanguageEnglish,
    isLanguageJapanese,
    setLanguageJapanese,
    openSetupNavigationPanel,
    isDarkTheme,
    setDarkTheme,
    showProjectQuickSetupPage,
    isDeveloperMode,
  };
}
