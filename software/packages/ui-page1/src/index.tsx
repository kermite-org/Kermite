import { addNumber, showVersion } from '@kermite/shared';
import { greet } from '~/local';

console.log('hello');

const el = document.getElementById('app');
if (el) {
  el.innerHTML = 'hello';
}

const c = addNumber(100, 200);
console.log({ c });

showVersion();

greet();
