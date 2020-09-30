import { models } from './models';
import { initialzeView, finalizeView } from './views';
import { dumpXpcSubscriptionsRemained } from './models/dataSource/ipc';

async function start() {
  console.log('start');

  models.initialize();
  initialzeView();

  window.addEventListener('beforeunload', async () => {
    finalizeView();
    models.finalize();
    dumpXpcSubscriptionsRemained();
  });
}

window.addEventListener('load', start);
