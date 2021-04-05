import { pathResolve } from '~/shell/funcs';

export const appConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  applicationVersion: process.env.npm_package_version || 'Unknown Version',
  publicRootPath: pathResolve('dist/ui'),
  preloadFilePath: pathResolve('dist/shell/preload.js'),
  pageTitle: 'Kermite',
  initialPageWidth: 1280,
  initialPageHeight: 800,
};
