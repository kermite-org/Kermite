export interface IEnvironmentConfig {
  isDevelopment: boolean;
}

export interface IEnvironmentConfigForRendererProcess {
  isDevelopment: boolean;
}

export interface IApplicationSettings {
  showTestInputArea: boolean;
}

export const fallabackApplicationSettings: IApplicationSettings = {
  showTestInputArea: false
};

export type IKeyboardBehaviorMode = 'Standalone' | 'SideBrain';
export type IKeyboardLanguage = 'US' | 'JP';

export interface IKeyboardConfig {
  behaviorMode: IKeyboardBehaviorMode;
  keyboardLanguage: IKeyboardLanguage;
}

export const fallbackKeyboardConfig: IKeyboardConfig = {
  behaviorMode: 'Standalone',
  keyboardLanguage: 'US'
};
