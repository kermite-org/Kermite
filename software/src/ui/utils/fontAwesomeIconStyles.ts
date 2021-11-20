import { fontAwesomeIconNameToUnicodeMap } from '~/ui/utils/fontAwesomeIconNameToUnicodeMap';

export function getFontAwesomeIconPseudoElementStyle(
  iconName: keyof typeof fontAwesomeIconNameToUnicodeMap,
) {
  const code = fontAwesomeIconNameToUnicodeMap[iconName] || '';
  const rawCode = code.replace('\f', '');
  return unescape(
    `content: '\\f${rawCode}'; font-family: 'Font Awesome 5 Free'; font-weight: 900;`,
  );
}
