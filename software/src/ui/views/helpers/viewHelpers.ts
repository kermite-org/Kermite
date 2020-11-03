export function classes(...classNames: (string | undefined)[]) {
  return classNames.filter((a) => !!a).join(' ');
}
