import { appModel } from './models/AppModel';
import { initialzeView } from './views';

function start() {
  console.log('start');

  appModel.initialize();
  initialzeView();

  window.addEventListener('beforeunload', () => appModel.terminate());
}

window.addEventListener('load', start);
