import { addNumber, showVersion } from '@kermite/shared';
import { greet } from '~/local';

console.log('hello');

const el = document.getElementById('app');
if (el) {
  el.innerHTML = 'page1';
}

const c = addNumber(100, 200);
console.log({ c });

showVersion();

greet();

document.body.style.background = '#FFF';
