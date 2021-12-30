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
  // kermiteServerUrl:'http://localhost:5000'
  kermiteServerUrl: 'https://dev.server.kermite.org',
};
