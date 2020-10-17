import { initializeModel } from '~model';
import { initializeView } from '~view';

function start() {
  initializeModel();
  initializeView();
}
window.addEventListener('load', start);
