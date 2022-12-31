import svgPath from 'svgpath';

// easy testing
// https://stackoverflow.com/questions/54961620/test-if-svg-path-d-property-string-is-valid
export function validateSvgPathText_forEasyTesting(s: string): boolean {
  const reEverythingAllowed = /[MmZzLlHhVvCcSsQqTtAa0-9-,.\s]/g;

  const bContainsIllegalCharacter = !!s.replace(reEverythingAllowed, '').length;
  const bContainsAdjacentLetters = /[a-zA-Z][a-zA-Z]/.test(s);
  const bInvalidStart = /^[0-9-,.]/.test(s);
  const bInvalidEnd = /.*[-,.]$/.test(s.trim());

  return !(
    bContainsIllegalCharacter ||
    bContainsAdjacentLetters ||
    bInvalidStart ||
    bInvalidEnd
  );
}

// comprehensive check
export function validateSvgPathText(str: string): boolean {
  const self = svgPath(str);
  return !(self as any).err;
}
