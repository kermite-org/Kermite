// based on goober
// https://github.com/cristianbote/goober

const newRule = /(?:([A-Z0-9-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(})/gi;
const ruleClean = /\/\*[\s\S]*?\*\/|\s{2,}|\n/gm;

// Convert a css style string into a object
const astish = (val: string): any => {
  const tree: any = [{}];
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

// Parses the object into css, scoped, blocks
const parse = (obj: any, selector: string) => {
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

// ----------------------------------------------------------------------

function findKeyByValue(
  dict: { [key: string]: string },
  value: string,
): string | undefined {
  for (const key in dict) {
    if (dict[key] === value) {
      return key;
    }
  }
}

let seqClassNameIndex = 0;
const classNameIndexTable: { [key: string]: number } = {};

const getUniqueClassName = (cssText: string, label?: string) => {
  let index = classNameIndexTable[cssText];
  if (!index) {
    index = classNameIndexTable[cssText] = seqClassNameIndex++;
  }
  const prefix = 'go';
  return label ? `${prefix}${index}_${label}` : `${prefix}_${index}`;
};

interface ILocalSheet {
  data: string;
}

let gSheet: HTMLStyleElement | undefined;

function getLocalSheet(): ILocalSheet {
  if (!gSheet) {
    gSheet = document.createElement('style');
    gSheet.innerHTML = ' ';
    gSheet.id = '_goober_ex';
    document.head.appendChild(gSheet);
  }
  return gSheet.firstChild as any;
}

function updateLocalSheet(cssText0: string) {
  const sheet = getLocalSheet();
  const cssText = cssText0.replace(/label:.+?;/g, '');
  if (!sheet.data.includes(cssText)) {
    sheet.data = sheet.data + cssText;
  }
}

function extractLabel(cssText: string): string | undefined {
  const m = cssText.match(/label: (.+);/);
  return m?.[1];
}

function extractCssTemplate(
  template: TemplateStringsArray,
  values: (string | number)[],
): string {
  let text = '';
  let i = 0;
  for (i = 0; i < values.length; i++) {
    text += template[i];
    text += values[i].toString();
  }
  text += template[i];
  return text;
}

const cssTextToClassNameMap: { [sourceCssText: string]: string } = {};

export function css(
  template: TemplateStringsArray,
  ...templateParameters: (string | number)[]
): string {
  const cssText = extractCssTemplate(template, templateParameters);
  if (cssTextToClassNameMap[cssText]) {
    return cssTextToClassNameMap[cssText];
  }
  const label = extractLabel(cssText);
  const className = getUniqueClassName(cssText, label);
  const ast = astish(cssText);
  const parsed = parse(ast, `.${className}`);
  updateLocalSheet(parsed);

  cssTextToClassNameMap[cssText] = className;
  return className;
}

export function applyGlobalStyle(className: string) {
  const cssText = findKeyByValue(cssTextToClassNameMap, className);
  if (cssText) {
    const ast = astish(cssText);
    const parsed = parse(ast, '');
    updateLocalSheet(parsed);
  }
}

let jsxCreateElementFunction: Function;
export function setJsxCreateElementFunction(pragma: Function): void {
  jsxCreateElementFunction = pragma;
}

type IStyledComponentGenerator<T extends keyof JSX.IntrinsicElements> = (
  template: TemplateStringsArray,
  ...templateParameters: (string | number)[]
) => (props: JSX.IntrinsicElements[T]) => JSX.Element;

export const styled: {
  [K in keyof JSX.IntrinsicElements]: IStyledComponentGenerator<K>;
} = new Proxy(
  {},
  {
    get: <K extends keyof JSX.IntrinsicElements>(_target: any, tag: K) => {
      return (...args: Parameters<typeof css>) => {
        const className = css(...args);
        return (props: JSX.IntrinsicElements[K]) => {
          return jsxCreateElementFunction(tag, { ...props, className });
        };
      };
    },
  },
) as any;
