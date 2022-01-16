import { languageSelectionStore, themeSelectionStore } from '~/ui/commonModels';
import { globalSettingsWriter, uiActions, uiState } from '~/ui/store';

interface IWelcomePageStore {
  readers: {
    appVersion: string;
    isLanguageEnglish: boolean;
    isLanguageJapanese: boolean;
    isDarkTheme: boolean;
    isDeveloperMode: boolean;
  };
  actions: {
    setLanguageEnglish(): void;
    setLanguageJapanese(): void;
    showProfileSetupWizard(): void;
    setDarkTheme(isDark: boolean): void;
    showProjectQuickSetupWizard(): void;
    setDeveloperMode(value: boolean): void;
  };
}

function createWelcomePageStore(): IWelcomePageStore {
  const readers = {
    get appVersion() {
      return uiState.core.applicationVersionInfo.version;
    },
    get isLanguageEnglish() {
      return languageSelectionStore.currentLanguage === 'english';
    },
    get isLanguageJapanese() {
      return languageSelectionStore.currentLanguage === 'japanese';
    },
    get isDarkTheme() {
      return themeSelectionStore.currentThemeKey === 'dark';
    },
    get isDeveloperMode() {
      return themeSelectionStore.currentThemeKey === 'light';
    },
  };

  const actions = {
    setLanguageEnglish() {
      languageSelectionStore.changeLanguage('english');
    },
    setLanguageJapanese() {
      languageSelectionStore.changeLanguage('japanese');
    },
    showProfileSetupWizard() {},
    setDarkTheme(isDark: boolean) {
      themeSelectionStore.changeTheme(isDark ? 'dark' : 'light');
    },
    showProjectQuickSetupWizard() {
      uiActions.showProfileSetupWizard();
    },
    setDeveloperMode(value: boolean) {
      globalSettingsWriter.writeValue('developerMode', value);
    },
  };

  return { readers, actions };
}

export const welcomePageStore = createWelcomePageStore();
