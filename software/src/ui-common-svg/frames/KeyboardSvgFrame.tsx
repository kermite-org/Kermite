import { jsx, css } from 'qx';
import { IDisplayArea } from '~/shared';

function getViewBox(da: IDisplayArea) {
  const left = da.centerX - da.width / 2;
  const top = da.centerY - da.height / 2;
  const { width, height } = da;
  return `${left} ${top} ${width} ${height}`;
}

export const KeyboardSvgFrame = (props: {
  displayArea: IDisplayArea;
  dpiScale: number;
  children: JSX.Element[];
  baseStrokeWidth: number;
}) => {
  const cssSvgFrame = css`
    user-select: none;
  `;

  const { displayArea, dpiScale, children, baseStrokeWidth } = props;
  const viewBox = getViewBox(displayArea);

  return (
    <svg
      width={displayArea.width * dpiScale}
      height={displayArea.height * dpiScale}
      viewBox={viewBox}
      css={cssSvgFrame}
    >
      <g stroke-width={baseStrokeWidth} stroke-linejoin="round">
        {children}
      </g>
    </svg>
  );
};
