// import { initializeCss } from '~/cssInitializer';
import { startPreactPart } from '~/dev0/preactPart';
import { startQxPart } from '~/dev0/qxPart';

window.addEventListener('load', () => {
  // initializeCss();
  startPreactPart();
  startQxPart();
});
