export type ICoreState = {
  appVersion: string;
};

export type IUiState = {
  core: ICoreState;
};

export type ICoreAction = Partial<{
  loadAppVersion?: 1;
  greet: { name: string; age: number };
}>;

export type IUiAction = Partial<{}>;
