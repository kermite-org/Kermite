import { models } from './models';
import { initialzeView } from './views';

async function start() {
  console.log('start');

  await models.initialize();
  initialzeView();

  window.addEventListener('beforeunload', () => models.terminate());
}

window.addEventListener('load', start);
