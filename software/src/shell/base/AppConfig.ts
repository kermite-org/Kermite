import { app } from 'electron';
import { pathDirname } from '~/shell/funcs';

export const appConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  applicationVersion: app.getVersion(),
  publicRootPath: `${pathDirname(__dirname)}/ui`,
  preloadFilePath: `${__dirname}/preload.js`,
  pageTitle: 'Kermite',
  initialPageWidth: 1280,
  initialPageHeight: 800,
  onlineResourcesBaseUrl: 'https://app.kermite.org/krs/resources2',
  kermiteServerUrl: 'https://dev.server.kermite.org',
};
if (process.env.USE_KERMITE_SERVER_LOCAL) {
  appConfig.kermiteServerUrl = 'http://localhost:5000';
}
