import { pathDirname } from '~/shell/funcs';

declare let KERMITE_APP_VERSION: string;

export const appConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  applicationVersion: KERMITE_APP_VERSION,
  publicRootPath: `${pathDirname(__dirname)}/ui`,
  preloadFilePath: `${__dirname}/preload.js`,
  pageTitle: 'Kermite',
  initialPageWidth: 1280,
  initialPageHeight: 800,
};
