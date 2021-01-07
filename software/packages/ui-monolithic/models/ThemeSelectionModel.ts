import { themeColors, ThemeKey, uiThemeConfigLoader } from '~ui/core';

const allThemeKeys = Object.keys(themeColors) as ThemeKey[];

export class ThemeSelectionModel {
  private currentThemeKey: ThemeKey = 'light';

  get currentTheme() {
    return this.currentThemeKey;
  }

  get themeOptions() {
    return allThemeKeys;
  }

  changeTheme = (themeKey: ThemeKey) => {
    if (themeKey !== this.currentThemeKey) {
      uiThemeConfigLoader.saveThemeKey(themeKey);
      location.reload();
    }
  };

  initialize() {
    this.currentThemeKey = uiThemeConfigLoader.loadThemeKey();
  }
}
