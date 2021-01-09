export interface IEnvironmentConfig {
  isDevelopment: boolean;
}

export interface IEnvironmentConfigForRendererProcess {
  isDevelopment: boolean;
}

export interface IApplicationSettings {
  // メインプロセスで保持・永続化するべきデータがあればここに追加する
  // レンダラプロセスで扱うデータはui/models/UiStatusModelで永続化する
}

export const fallabackApplicationSettings: IApplicationSettings = {
  showTestInputArea: false,
};
