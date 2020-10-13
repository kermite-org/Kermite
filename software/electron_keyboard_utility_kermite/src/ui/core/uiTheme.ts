// todo
// UIのテキスト項目を追加するたび3箇所の変更が必要なためUI実装時の手間が多い
// 一箇所のみの変更で色を追加できるようにし、他をあとから調整できるような方法を考える

type ThemeColorKey =
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
    clBackground: '#2E323E',
    clTitleBar: '#F61189',
    clStatusBar: '#3563b7',
    clNavigationColumn: '#1d1d1d',
    clPanelBox: '#181C23',
    clSelectHighlight: '#22967d',
    clHoldHighlight: '#f90',
    clMainText: '#FFF',
    clAltText: '#000',
    clWindowButtonFace: '#FFF',
    clWindowButtonHoverBack: '#f8b',
    clKeyboardBodyFace: '#54566f',
    clKeyUnitFace: 'rgba(0, 0, 0, 0.5)',
    clKeyUnitLegend: '#fff',
    clKeyUnitLegendWeak: 'rgba(128, 128, 128, 0.2)',
    clAssignCardFace: '#383838',
    clAssignCardText: '#FFF',
    clCommonFrame: '#444',
    dummy: '0'
  },
  light: {
    clBackground: '#c8d3e3',
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
    clKeyUnitFace: 'rgba(255, 255, 255, 0.9)',
    clKeyUnitLegend: '#568',
    clKeyUnitLegendWeak: 'rgba(128, 128, 128, 0.2)',
    clAssignCardFace: '#EEE',
    clAssignCardText: '#348',
    clCommonFrame: '#08d',
    dummy: '0'
  }
};

export const uiTheme: { colors: IThemeColorSet } = {
  colors: themeColors.light
};
