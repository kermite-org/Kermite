export function combineClasses(...classNames: (string | undefined)[]) {
  return classNames.filter((a) => !!a).join(' ');
}

export const styleWidthSpec = (width: number) => ({ width: `${width}px` });
