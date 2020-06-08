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
export type IKeyboardLayoutStandard = 'US' | 'JIS';

export interface IKeyboardConfig {
  behaviorMode: IKeyboardBehaviorMode;
  layoutStandard: IKeyboardLayoutStandard;
}

export const fallbackKeyboardConfig: IKeyboardConfig = {
  behaviorMode: 'Standalone',
  layoutStandard: 'US'
};
