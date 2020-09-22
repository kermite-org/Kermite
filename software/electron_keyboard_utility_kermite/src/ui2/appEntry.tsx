import { appDomain } from './models/zAppDomain';
import { initialzeView } from './views';

async function start() {
  console.log('start');

  await appDomain.initialize();
  initialzeView();

  window.addEventListener('beforeunload', () => appDomain.terminate());
}

window.addEventListener('load', start);
