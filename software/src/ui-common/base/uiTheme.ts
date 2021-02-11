// todo
// UIのテキスト項目を追加するたび3箇所の変更が必要なためUI実装時の手間が多い
// 一箇所のみの変更で色を追加できるようにし、他をあとから調整できるような方法を考える

type ThemeColorKey =
  | 'clPageBackground'
  | 'clBackground'
  | 'clTitleBar'
  | 'clStatusBar'
  | 'clNavigationColumn'
  | 'clPanelBox'
  | 'clSelectHighlight'
  | 'clHoldHighlight'
  | 'clMainText'
  | 'clAltText'
  | 'clWindowButtonFace'
  | 'clWindowButtonHoverBack'
  | 'clKeyboardBodyFace'
  | 'clKeyUnitFace'
  | 'clKeyUnitLegend'
  | 'clKeyUnitLegendWeak'
  | 'clAssignCardFace'
  | 'clAssignCardText'
  | 'clCommonFrame'
  | 'dummy';

type IThemeColorSet = { [key in ThemeColorKey]: string };

export type ThemeKey = 'dark' | 'light';

export const themeColors: { [key in ThemeKey]: IThemeColorSet } = {
  dark: {
    clPageBackground: '#333',
    clBackground: '#2E323E',
    clTitleBar: '#F61189',
    clStatusBar: '#3563b7',
    clNavigationColumn: '#1d1d1d',
    clPanelBox: '#181C23',
    clSelectHighlight: '#22967d',
    clHoldHighlight: '#f90',
    clMainText: '#FFF',
    clAltText: '#FFF',
    clWindowButtonFace: '#FFF',
    clWindowButtonHoverBack: '#f8b',
    clKeyboardBodyFace: '#54566f',
    clKeyUnitFace: 'rgba(0, 0, 0, 0.5)',
    clKeyUnitLegend: '#fff',
    clKeyUnitLegendWeak: 'rgba(128, 128, 128, 0.2)',
    clAssignCardFace: '#383838',
    clAssignCardText: '#FFF',
    clCommonFrame: '#444',
    dummy: '0',
  },
  light: {
    clPageBackground: '#c8d3e3',
    clBackground: '#f8fAfC',
    clTitleBar: '#02cee1',
    clStatusBar: '#02cee1',
    clNavigationColumn: '#3870A3',
    clPanelBox: '#FFF',
    // clSelectHighlight: '#80c8ff',
    clSelectHighlight: '#af0',
    clHoldHighlight: '#0CF',
    clMainText: '#268EC9',
    clAltText: '#000',
    clWindowButtonFace: '#FFF',
    clWindowButtonHoverBack: '#08d',
    clKeyboardBodyFace: '#9aadd8',
    clKeyUnitFace: '#f6f8fA',
    clKeyUnitLegend: '#568',
    clKeyUnitLegendWeak: 'rgba(128, 128, 128, 0.2)',
    clAssignCardFace: '#EEE',
    clAssignCardText: '#348',
    clCommonFrame: '#08d',
    dummy: '0',
  },
};

interface IUiTheme {
  unitHeight: number;
  colors: IThemeColorSet;
}

export const uiThemeConfigLoader = {
  loadThemeKey() {
    const themeKey = localStorage.getItem('themeKey') as ThemeKey;
    if (Object.keys(themeColors).includes(themeKey)) {
      return themeKey;
    }
    return 'light';
  },
  saveThemeKey(themeKey: ThemeKey) {
    localStorage.setItem('themeKey', themeKey);
  },
};

const currentThemeKey = uiThemeConfigLoader.loadThemeKey();

export const uiTheme_original: IUiTheme = {
  unitHeight: 26,
  colors: themeColors[currentThemeKey],
};

// UI刷新のため一時的に即値によるテーマを使用
export const uiTheme = {
  unitHeight: 26,
  controlBorderRadius: 0,
  colors: {
    // --------
    // dark
    clBackground: '#112',
    clForegroud: '#FFF',
    clControlBase: '#222',
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
    clCommonFrame: '#444',
    // --------
    // light
    // clBackground: '#f8fAfC',
    // clForegroud: '#000',
    // clControlBase: '#F8F8F8',
    // clDecal: '#FFF',
    // clPrimary: '#1AD',
    // clControlText: '#126',
    // clInvalidInput: '#f003',
    // clWindowBar: '#15A5D2',
    // clPageBackground: '#c8d3e3',
    // clNavigationColumn: '#347',
    // clPanelBox: '#FFF',
    // clWindowButtonHoverBack: '#4bf',
    // clMainText: '#18C',
    // clSelectHighlight: '#0cf8',
    // clHoldHighlight: '#FC0',
    // clAltText: '#000',
    // clWindowButtonFace: '#FFF',
    // clKeyboardBodyFace: '#9aadd8',
    // clKeyUnitFace: '#f6f8fA',
    // clKeyUnitLegend: '#568',
    // clKeyUnitLegendWeak: 'rgba(128, 128, 128, 0.2)',
    // clAssignCardFace: '#EEE',
    // clAssignCardText: '#348',
    // clCommonFrame: '#08d',
    // --------
  },
};
