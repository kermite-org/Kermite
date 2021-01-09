import { Views } from '~/views/ViewIndex';
import { models } from './models';

async function start() {
  console.log('start');

  const views = new Views();
  await models.initialize();
  views.initialize();

  window.addEventListener('beforeunload', () => {
    views.finalize();
    models.finalize();
  });
}

window.addEventListener('load', start);
