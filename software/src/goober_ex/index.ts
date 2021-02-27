/**
 * Transforms the input into a className.
 * The multiplication constant 101 is selected to be a prime,
 * as is the initial value of 11.
 * The intermediate and final results are truncated into 32-bit
 * unsigned integers.
 * @param {String} str
 * @returns {String}
 */
const toHash = (str, label) => {
  const sig0 = str
    .split('')
    .reduce((out, i) => (101 * out + i.charCodeAt(0)) >>> 0, 11);

  const prefix = `go`;
  const sig = parseInt(sig0).toString(36);
  return label ? `${prefix}_${sig}_${label}` : `${prefix}_${sig}`;
};

const newRule = /(?:([A-Z0-9-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(})/gi;
const ruleClean = /\/\*[\s\S]*?\*\/|\s{2,}|\n/gm;

/**
 * Convert a css style string into a object
 * @param {String} val
 * @returns {Object}
 */
const astish = (val) => {
  const tree = [{}];
  let block;

  while ((block = newRule.exec(val.replace(ruleClean, '')))) {
    // Remove the current entry
    if (block[4]) tree.shift();

    if (block[3]) {
      tree.unshift((tree[0][block[3]] = tree[0][block[3]] || {}));
    } else if (!block[4]) {
      tree[0][block[1]] = block[2];
    }
  }

  return tree[0];
};

/**
 * Updates the target and keeps a local cache
 * @param {String} css
 * @param {Object} sheet
 * @param {Boolean} append
 */
const update = (css, sheet, append) => {
  sheet.data.indexOf(css) === -1 &&
    (sheet.data = append ? css + sheet.data : sheet.data + css);
};

/**
 * Parses the object into css, scoped, blocks
 * @param {Object} obj
 * @param {String} selector
 * @param {String} wrapper
 */
const parse = (obj, selector) => {
  let outer = '';
  let blocks = '';
  let current = '';
  let next;

  for (const key in obj) {
    const val = obj[key];

    // If this is a 'block'
    if (typeof val === 'object') {
      next = selector
        ? // Go over the selector and replace the matching multiple selectors if any
          selector.replace(/([^,])+/g, (sel) => {
            // Return the current selector with the key matching multiple selectors if any
            return key.replace(/([^,])+/g, (k) => {
              // If the current `k`(key) has a nested selector replace it
              if (/&/g.test(k)) return k.replace(/&/g, sel);

              // If there's a current selector concat it
              return sel ? sel + ' ' + k : k;
            });
          })
        : key;

      // If these are the `@` rule
      if (key[0] === '@') {
        // Handling the `@font-face` where the
        // block doesn't need the brackets wrapped
        if (key[1] === 'f') {
          blocks += parse(val, key);
        } else {
          // Regular rule block
          blocks +=
            key + '{' + parse(val, key[1] === 'k' ? '' : selector) + '}';
        }
      } else {
        // Call the parse for this block
        blocks += parse(val, next);
      }
    } else {
      if (key[0] === '@' && key[1] === 'i') {
        outer = key + ' ' + val + ';';
      } else {
        const parse_p = (parse as any).p;
        // Push the line for this property
        current += parse_p
          ? // We have a prefixer and we need to run this through that
            parse_p(key.replace(/[A-Z]/g, '-$&').toLowerCase(), val)
          : // Nope no prefixer just append it
            key.replace(/[A-Z]/g, '-$&').toLowerCase() + ':' + val + ';';
      }
    }
  }

  // If we have properties
  if (current[0]) {
    // Standard rule composition
    next = selector ? selector + '{' + current + '}' : current;

    // Else just push the rule
    return outer + next + blocks;
  }

  return outer + blocks;
};

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

/**
 * Can parse a compiled string, from a tagged template
 * @param {String} value
 * @param {Object} [props]
 */
export const compile = (str, defs, data) => {
  return str.reduce((out, next, i) => {
    let tail = defs[i];

    // If this is a function we need to:
    if (tail?.call) {
      // 1. Call it with `data`
      const res = tail(data);

      // 2. Grab the className
      const className = res?.props && res.props.className;

      // 3. If there's none, see if this is basically a
      // previously styled className by checking the prefix
      const end = className || (/^go/.test(res) && res);

      if (end) {
        // If the `end` is defined means it's a className
        tail = '.' + end;
      } else if (res && typeof res === 'object') {
        // If `res` it's an object, we're either dealing with a vnode
        // or an object returned from a function interpolation
        tail = res.props ? '' : parse(res, '');
      } else {
        // Regular value returned. Can be falsy as well
        tail = res;
      }
    }
    return out + next + (tail === null ? '' : tail);
  }, '');
};

const GOOBER_ID = '_goober';
const ssr = {
  data: '',
};

/**
 * Returns the _commit_ target
 * @param {Object} [target]
 * @returns {HTMLStyleElement|{data: ''}}
 */
const getSheet = (target) => {
  if (typeof window !== 'undefined') {
    // Querying the existing target for a previously defined <style> tag
    // We're doing a querySelector because the <head> element doesn't implemented the getElementById api
    let sheet = target
      ? target.querySelector('#' + GOOBER_ID)
      : window[GOOBER_ID];
    if (!sheet) {
      // Note to self: head.innerHTML +=, triggers a layout/reflow. Avoid it.
      sheet = (target || document.head).appendChild(
        document.createElement('style'),
      );
      sheet.innerHTML = ' ';
      sheet.id = GOOBER_ID;
    }
    return sheet.firstChild;
  }
  return target || ssr;
};

/**
 * Extracts and wipes the cache
 * @returns {String}
 */
export const extractCss = (target) => {
  const sheet = getSheet(target);
  const out = sheet.data;
  sheet.data = '';
  return out;
};

/**
 * css entry
 * @param {String|Object|Function} val
 */
export function css(val: any, ...args: any[]) {
  const ctx = this || {};
  const _val = val.call ? val(ctx.p) : val;

  return hash(
    _val.unshift
      ? _val.raw
        ? // Tagged templates
          // eslint-disable-next-line prefer-rest-params
          compile(_val, [].slice.call(arguments, 1), ctx.p)
        : // Regular arrays
          _val.reduce(
            (o, i) => (i ? Object.assign(o, i.call ? i(ctx.p) : i) : o),
            {},
          )
      : _val,
    getSheet(ctx.target),
    ctx.g,
    ctx.o,
    ctx.k,
  );
}

/**
 * CSS Global function to declare global styles
 * @type {Function}
 */
export const glob = css.bind({ g: 1 });

/**
 * `keyframes` function for defining animations
 * @type {Function}
 */
export const keyframes = css.bind({ k: 1 });

let h, useTheme, fwdProp;
export function setup(pragma: any, prefix?, theme?, forwardProps?) {
  // This one needs to stay in here, so we won't have cyclic dependencies
  (parse as any).p = prefix;

  // These are scope to this context
  h = pragma;
  useTheme = theme;
  fwdProp = forwardProps;
}

/**
 * styled function
 * @param {string} tag
 * @param {function} forwardRef
 */
export function styled(tag, forwardRef) {
  const _ctx = this || {};

  return function wrapper() {
    // eslint-disable-next-line prefer-rest-params
    const _args = arguments;

    function Styled(props, ref) {
      // Grab a shallow copy of the props
      const _props = Object.assign({}, props);

      // Keep a local reference to the previous className
      const _previousClassName = _props.className || (Styled as any).className;

      // _ctx.p: is the props sent to the context
      _ctx.p = Object.assign({ theme: useTheme?.() }, _props);

      // Set a flag if the current components had a previous className
      // similar to goober. This is the append/prepend flag
      // The _empty_ space compresses better than `\s`
      _ctx.o = / *go\d+/g.test(_previousClassName);

      _props.className =
        // Define the new className
        css.apply(_ctx, _args as any) +
        (_previousClassName ? ' ' + _previousClassName : '');

      // If the forwardRef fun is defined we have the ref
      if (forwardRef) {
        _props.ref = ref;
      }

      // Let the closure do the capture, cause it might get removed in the fwdProp
      const _as = _props.as || tag;

      // Handle the forward props filter if defined and _as is a string
      if (fwdProp && _as[0]) {
        fwdProp(_props);
      }

      return h(_as, _props);
    }

    return forwardRef ? forwardRef(Styled) : Styled;
  };
}
