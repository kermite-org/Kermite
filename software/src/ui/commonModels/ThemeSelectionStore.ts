import { ThemeKey, uiThemeConfigLoader } from '~/ui/base';
import { dispatchCoreAction } from '~/ui/store/base';

interface IThemeSelectionStore {
  currentThemeKey: ThemeKey;
  changeTheme(themeKey: ThemeKey): void;
}

function createThemeSelectionStore(): IThemeSelectionStore {
  const currentThemeKey: ThemeKey = uiThemeConfigLoader.loadThemeKey();
  return {
    currentThemeKey,
    changeTheme(themeKey: ThemeKey) {
      if (themeKey !== currentThemeKey) {
        uiThemeConfigLoader.saveThemeKey(themeKey);
        // location.reload(); // Windowsの場合にうまくリロードされずにページが真っ白になってしまう問題がある
        dispatchCoreAction({ window_reloadPage: 1 });
      }
    },
  };
}

export const themeSelectionStore = createThemeSelectionStore();
