import { models } from './models';
import { initialzeRenderer, finalizeRenderer } from './rendererSetup';
import { dumpXpcSubscriptionsRemained } from './models/dataSource/ipc';

async function start() {
  console.log('start');

  models.initialize();
  initialzeRenderer();

  window.addEventListener('beforeunload', async () => {
    finalizeRenderer();
    models.finalize();
    dumpXpcSubscriptionsRemained();
  });
}

window.addEventListener('load', start);
