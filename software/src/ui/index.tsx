import { dumpXpcSubscriptionsRemained } from '~ui/core';
import { initialzeRenderer, finalizeRenderer } from './domSetup';
import { models } from './models';

async function start() {
  console.log('start');

  await models.initialize();
  initialzeRenderer();

  window.addEventListener('beforeunload', async () => {
    finalizeRenderer();
    models.finalize();
    dumpXpcSubscriptionsRemained();
  });
}

window.addEventListener('load', start);
