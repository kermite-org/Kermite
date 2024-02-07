// import { app } from 'electron';

type IProcessEnv = {
  MODE: 'development' | 'production';
  DEV: boolean;
  PROD: boolean;
  FE_USE_KERMITE_SERVER_LOCAL?: boolean;
  FE_USE_DEBUG_LOCAL_FIRMWARES?: boolean;
  FE_DEBUG_SUPPRESS_ERROR_DIALOG?: boolean;
};

export const processEnv = (import.meta as any).env as IProcessEnv;
// console.log({ processEnv });

export const appConfig = {
  applicationVersion: 'v240207',
  isDevelopment: processEnv.DEV,
  // isDevelopment: location.host === 'localhost',
  // applicationVersion: app.getVersion(),
  // publicRootPath: `${pathDirname(__dirname)}/ui`,
  // preloadFilePath: `${__dirname}/preload.js`,
  pageTitle: 'Kermite',
  initialPageWidth: 1280,
  initialPageHeight: 800,
  onlineResourcesBaseUrl: 'https://assets.kermite.org/krs/resources2',
  kermiteServerUrl: 'https://server.kermite.org',
  useDebugLocalFirmwares: !!processEnv.FE_USE_DEBUG_LOCAL_FIRMWARES,
  debugSuppressErrorDialog: !!processEnv.FE_DEBUG_SUPPRESS_ERROR_DIALOG,
};
if (processEnv.FE_USE_KERMITE_SERVER_LOCAL) {
  appConfig.kermiteServerUrl = 'http://localhost:5000';
}
