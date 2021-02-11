export function combineClasses(...classNames: (string | undefined)[]) {
  return classNames.filter((a) => !!a).join(' ');
}
