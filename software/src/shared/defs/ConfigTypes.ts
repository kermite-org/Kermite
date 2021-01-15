export type IKeyboardBehaviorMode = 'Standalone' | 'SideBrain';
export type IKeyboardLayoutStandard = 'US' | 'JIS';

export interface IKeyboardConfig {
  behaviorMode: IKeyboardBehaviorMode;
  layoutStandard: IKeyboardLayoutStandard;
}

export const fallbackKeyboardConfig: IKeyboardConfig = {
  behaviorMode: 'Standalone',
  layoutStandard: 'US',
};
