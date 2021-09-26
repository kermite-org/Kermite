import { useMemo } from 'qx';
import { ThemeKey, uiThemeConfigLoader } from '~/ui/base';
import { dispatchCoreAction } from '~/ui/store/base';

interface IThemeSelectionModel {
  currentThemeKey: ThemeKey;
  // themeOptions: ThemeKey[];
  changeTheme(themeKey: ThemeKey): void;
}

export function useThemeSelectionModel(): IThemeSelectionModel {
  const currentThemeKey = useMemo(uiThemeConfigLoader.loadThemeKey, []);
  return {
    currentThemeKey,
    // themeOptions: Object.keys(themeColors) as ThemeKey[],
    changeTheme: (themeKey: ThemeKey) => {
      if (themeKey !== currentThemeKey) {
        uiThemeConfigLoader.saveThemeKey(themeKey);
        // location.reload(); // Windowsの場合にうまくリロードされずにページが真っ白になってしまう問題がある
        dispatchCoreAction({ window_reloadPage: 1 });
      }
    },
  };
}
