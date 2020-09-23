import { themeColors, uiTheme, ThemeKey } from './UiTheme';

const allThemeKeys = Object.keys(themeColors) as ThemeKey[];

export class ThemeSelectionModel {
  private currentThemeKey: ThemeKey | undefined;

  private applyTheme(themeKey: ThemeKey) {
    if (themeKey !== this.currentThemeKey) {
      const colors = themeColors[themeKey];
      if (colors) {
        this.currentThemeKey = themeKey;
        uiTheme.colors = colors;
      }
    }
  }

  get currentTheme() {
    return this.currentThemeKey;
  }

  get themeOptions() {
    return allThemeKeys;
  }

  changeTheme(themeKey: ThemeKey) {
    this.applyTheme(themeKey);
    location.reload();
  }

  loadThemeKey(): ThemeKey {
    const themeKey = localStorage.getItem('themeKey') as ThemeKey;
    if (allThemeKeys.includes(themeKey)) {
      return themeKey;
    }
    return 'light';
  }

  async initialize() {
    this.applyTheme(this.loadThemeKey());
  }

  async finalize() {
    localStorage.setItem('themeKey', this.currentThemeKey || 'light');
  }
}