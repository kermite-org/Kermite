const attributeNameMappers: { [key: string]: string } = {
  m: 'margin',
  p: 'padding',
  col: 'color',
  bg: 'background',
  mt: 'marginTop',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mr: 'marginRight',
  pt: 'paddingTop',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  pr: 'paddingRight',
  w: 'width',
  h: 'height',
};

function attrName(text: string) {
  return attributeNameMappers[text] || text;
}

export function shortCssProcessor0_deprecated(source: string): string {
  let text = source;

  let parts = text.split(' ');
  const keyValueReplacer = (_: any, p1: string, p2: string) =>
    `${attrName(p1)}:${p2};`;

  parts = parts.map((part) =>
    part
      .replace(
        /^centerFlex$/,
        'display: flex; justifyContent: center; alignItems: center;',
      )
      .replace(/^flex$/, 'display: flex;')
      .replace(/^border-([sd])(\d+)-(.*)$/, (_, p1, p2, p3) => {
        const form = p1 === 's' ? 'solid' : 'dashed';
        const width = `${p2}px`;
        const col = p3;
        return `border: ${form} ${width} ${col};`;
      })
      .replace(/^(.*)\[(.*)\]$/, keyValueReplacer)
      .replace(/^(.*?)-(.*)$/, keyValueReplacer)
      .replace(/^(.*)\((.*)\)$/, keyValueReplacer),
  );
  text = parts.join(' ');
  return text;
}

const predefinedMacros: { [key: string]: string } = {
  $centerFlex: 'display: flex; justify-content: center; align-items: center',
};

export function shortCssProcessor(source: string): string {
  if (source.includes(':') && source.includes(';')) {
    for (const key in predefinedMacros) {
      const value = predefinedMacros[key];
      source = source.replace(key, value);
    }
    return source;
  }

  let parts = source.match(/[^\s[]+(\[.*?\])?/g);
  if (parts) {
    parts = parts.map((part) => {
      const m = part.match(/^(.*)\[(.*)\]$/);
      if (m) {
        const key = m[1];
        const values = m[2];
        return `${key}:${values};`;
      } else {
        return `${predefinedMacros[part] || part};`;
      }
    });
    const res = parts.join(' ');
    // console.log({ source, res });
    return res;
  }
  return source;
}
