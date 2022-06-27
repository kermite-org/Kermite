// import { app } from 'electron';

type IProcessEnv = {
  NODE_ENV: 'development' | 'production';
  FE_USE_KERMITE_SERVER_LOCAL?: boolean;
  FE_USE_DEBUG_LOCAL_FIRMWARES?: boolean;
};

export const processEnv = (import.meta as any).env as IProcessEnv;
// console.log({ processEnv });

export const appConfig = {
  isDevelopment: processEnv.NODE_ENV === 'development',
  // isDevelopment: location.host === 'localhost',
  // applicationVersion: app.getVersion(),
  applicationVersion: 'v220628b',
  // publicRootPath: `${pathDirname(__dirname)}/ui`,
  // preloadFilePath: `${__dirname}/preload.js`,
  pageTitle: 'Kermite',
  initialPageWidth: 1280,
  initialPageHeight: 800,
  onlineResourcesBaseUrl: 'https://app.kermite.org/krs/resources2',
  kermiteServerUrl: 'https://dev.server.kermite.org',
  useDebugLocalFirmwares: !!processEnv.FE_USE_DEBUG_LOCAL_FIRMWARES,
};
if (processEnv.FE_USE_KERMITE_SERVER_LOCAL) {
  appConfig.kermiteServerUrl = 'http://localhost:5000';
}
