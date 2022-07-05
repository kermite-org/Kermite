import { checkValidOptionOrDefault } from '~/shared';

const themeColorsDark = {
  clBackground: '#202634',
  clForeground: '#FFF',
  clControlBase: '#2226',
  clDecal: '#FFF',
  clPrimary: '#09A',
  clControlText: '#09A',
  clInvalidInput: '#f004',
  clWindowBar: '#29B',
  clPageBackground: '#334',
  clNavigationColumn: '#1C3057',
  clPanelBox: '#181C23',
  clWindowButtonHoverBack: '#4bf',
  clMainText: '#09A',
  clSelectHighlight: '#0BD6',
  clHoldHighlight: '#f90',
  clAltText: '#FFF',
  clWindowButtonFace: '#FFF',
  clKeyboardBodyFace: '#54566f',
  clKeyUnitFace: 'rgba(0, 0, 0, 0.5)',
  clKeyUnitLegend: '#fff',
  clKeyUnitLegendWeak: 'rgba(128, 128, 128, 0.2)',
  clAssignCardFace: '#383838',
  clAssignCardText: '#FFF',
  clSpecialAccent: '#dbff00',
  clLinkIndicator: '#FFF',
  clLayouterKeyFace: '#3334',
  clLayouterKeyEdge: '#fffa',
  clLayouterKeyLegend: '#fff',
  clLayouterAxis: '#0845',
  clLayouterGrid: '#5554',

  projectKeyboard_bodyFill: '#99bae5',
  projectKeyboard_bodyEdge: '#004',
  projectKeyboard_keyFill: '#eee',
  projectKeyboard_keyEdge: '#004',

  wizardHorizontalBar: '#a1e744',
};

const themeColorsLight = {
  clBackground: '#f8fAfC',
  clForeground: '#000',
  clControlBase: '#F8F8F8',
  clDecal: '#FFF',
  clPrimary: '#1AD',
  clControlText: '#126',
  clInvalidInput: '#f003',
  clWindowBar: '#15A5D2',
  clPageBackground: '#c8d3e3',
  clNavigationColumn: '#347',
  clPanelBox: '#FFF',
  clWindowButtonHoverBack: '#4bf',
  clMainText: '#18C',
  clSelectHighlight: '#0cf8',
  clHoldHighlight: '#FC0',
  clAltText: '#000',
  clWindowButtonFace: '#FFF',
  clKeyboardBodyFace: '#9aadd8',
  clKeyUnitFace: '#f6f8fA',
  clKeyUnitLegend: '#568',
  clKeyUnitLegendWeak: 'rgba(128, 128, 128, 0.2)',
  clAssignCardFace: '#EEE',
  clAssignCardText: '#348',
  clSpecialAccent: '#dbff00',
  clLinkIndicator: '#FB0',
  clLayouterKeyFace: 'rgba(255, 255, 255, 0.3)',
  clLayouterKeyEdge: '#666',
  clLayouterKeyLegend: '#000',
  clLayouterAxis: '#4442',
  clLayouterGrid: '#4441',

  projectKeyboard_bodyFill: '#99bae5',
  projectKeyboard_bodyEdge: '#004',
  projectKeyboard_keyFill: '#eee',
  projectKeyboard_keyEdge: '#004',

  wizardHorizontalBar: '#fd7',
  // wizardHorizontalBar: '#ddd',
};

type IThemeColorSet = { [key in keyof typeof themeColorsDark]: string };

export type ThemeKey = 'dark' | 'light';

export const themeColors: { [key in ThemeKey]: IThemeColorSet } = {
  dark: themeColorsDark,
  light: themeColorsLight,
};

export const uiThemeConfigLoader = {
  loadThemeKey(): ThemeKey {
    const themeKey = localStorage.getItem('themeKey') as ThemeKey;
    return checkValidOptionOrDefault<ThemeKey>(
      Object.keys(themeColors) as ThemeKey[],
      themeKey,
      'light',
    );
  },
  saveThemeKey(themeKey: ThemeKey) {
    localStorage.setItem('themeKey', themeKey);
  },
};

export const uiTheme = {
  unitHeight: 26,
  controlBorderRadius: 0,
  commonTransitionSpec: '0.15s ease',
};

// colors: themeColorsDark, // debug
export const colors = themeColors[uiThemeConfigLoader.loadThemeKey()];
