import { appDomain } from './models/zAppDomain';
import { initialzeView } from './views';

function start() {
  console.log('start');

  appDomain.initialize();
  initialzeView();

  window.addEventListener('beforeunload', () => appDomain.terminate());
}

window.addEventListener('load', start);
