// import { app } from 'electron';

export const processEnv = (import.meta as any).env;

export const appConfig = {
  isDevelopment: processEnv.NODE_ENV === 'development',
  // isDevelopment: location.host === 'localhost',
  // applicationVersion: app.getVersion(),
  applicationVersion: `v220620a`,
  // publicRootPath: `${pathDirname(__dirname)}/ui`,
  // preloadFilePath: `${__dirname}/preload.js`,
  pageTitle: 'Kermite',
  initialPageWidth: 1280,
  initialPageHeight: 800,
  onlineResourcesBaseUrl: 'https://app.kermite.org/krs/resources2',
  kermiteServerUrl: 'https://dev.server.kermite.org',
};
if (processEnv.USE_KERMITE_SERVER_LOCAL) {
  appConfig.kermiteServerUrl = 'http://localhost:5000';
}
