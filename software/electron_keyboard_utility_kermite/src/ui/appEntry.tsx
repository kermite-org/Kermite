import { models } from './models';
import { initialzeView } from './views';
import { dumpXpcSubscriptionsRemained } from './models/dataSource/ipc';

async function start() {
  console.log('start');

  await models.initialize();
  initialzeView();

  window.addEventListener('beforeunload', async () => {
    await models.terminate();
    dumpXpcSubscriptionsRemained();
  });
}

window.addEventListener('load', start);
