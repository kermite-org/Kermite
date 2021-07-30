import { jsx, css, QxChildren, FC } from 'qx';
import { IDisplayArea } from '~/shared';

type Props = {
  displayArea: IDisplayArea;
  dpiScale: number;
  children: QxChildren;
  baseStrokeWidth: number;
};

function getViewBoxSpec(da: IDisplayArea) {
  const left = da.centerX - da.width / 2;
  const top = da.centerY - da.height / 2;
  const { width, height } = da;
  return `${left} ${top} ${width} ${height}`;
}

export const KeyboardSvgFrame: FC<Props> = ({
  displayArea,
  dpiScale,
  children,
  baseStrokeWidth,
}) => (
  <svg
    width={displayArea.width * dpiScale}
    height={displayArea.height * dpiScale}
    viewBox={getViewBoxSpec(displayArea)}
    css={style}
  >
    <g stroke-width={baseStrokeWidth} stroke-linejoin="round">
      {children}
    </g>
  </svg>
);

const style = css`
  user-select: none;
`;
