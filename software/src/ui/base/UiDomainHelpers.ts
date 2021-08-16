import { IDisplayArea } from '~/shared';

export function getKeyboardSvgViewBoxSpec(displayArea: IDisplayArea) {
  const { centerX, centerY, width, height } = displayArea;
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  return `${left} ${top} ${width} ${height}`;
}
