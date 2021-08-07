import { IDisplayArea } from '~/shared';

export function getKeyboardSvgViewBoxSpec(dispalyArea: IDisplayArea) {
  const { centerX, centerY, width, height } = dispalyArea;
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  return `${left} ${top} ${width} ${height}`;
}
