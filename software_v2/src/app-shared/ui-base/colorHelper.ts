export function makeCssColor(color: number, alpha: number = 1.0): string {
  const rr = (color >> 16) & 0xff;
  const gg = (color >> 8) & 0xff;
  const bb = color & 0xff;
  return `rgba(${rr}, ${gg}, ${bb}, ${alpha})`;
}
