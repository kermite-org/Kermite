import { astish } from './astish';
import { parse } from './parse';
import { toHash } from './to-hash';
import { update } from './update';

/**
 * In-memory cache.
 */
const cache = {};

/**
 * Stringifies a object structure
 * @param {Object} data
 * @returns {String}
 */
const stringify = (data) => {
  let out = '';

  for (const p in data) {
    const val = data[p];
    out += p + (typeof val === 'object' ? stringify(data[p]) : data[p]);
  }

  return out;
};

/**
 * Generates the needed className
 * @param {String|Object} compiled
 * @param {Object} sheet StyleSheet target
 * @param {Object} global Global flag
 * @param {Boolean} append Append or not
 * @param {Boolean} keyframes Keyframes mode. The input is the keyframes body that needs to be wrapped.
 * @returns {String}
 */
export const hash = (compiled, sheet, global, append, keyframes) => {
  // Get a string representation of the object or the value that is called 'compiled'
  const stringifiedCompiled =
    typeof compiled === 'object' ? stringify(compiled) : compiled;

  const m = stringifiedCompiled.match(/label: (.+);/);
  const label = m?.[1] || '';

  // Retrieve the className from cache or hash it in place
  const className =
    cache[stringifiedCompiled] ||
    (cache[stringifiedCompiled] = toHash(stringifiedCompiled, label));

  // If there's no entry for the current className
  if (!cache[className]) {
    // Build the _ast_-ish structure if needed
    const ast = typeof compiled === 'object' ? compiled : astish(compiled);
    delete ast.label;

    // Parse it
    cache[className] = parse(
      // For keyframes
      keyframes ? { ['@keyframes ' + className]: ast } : ast,
      global ? '' : '.' + className,
    );
  }

  // add or update
  update(cache[className], sheet, append);

  // return hash
  return className;
};
