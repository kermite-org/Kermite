type IShortCssReplacer = (text: string) => string;

let replacer: IShortCssReplacer | undefined;

export function setShortCssProcessor(_replacer: IShortCssReplacer) {
  replacer = _replacer;
}

const cached: { [shortCssText: string]: string } = {};

export function extractShortCss(source: string): string {
  if (cached[source]) {
    return cached[source];
  }
  const text = replacer?.(source) || source;
  cached[source] = text;
  return text;
}
