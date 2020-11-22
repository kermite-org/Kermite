import { h } from '~lib/qx';
import { IKeyboardShapeDisplayArea } from '~defs/ProfileData';

export const PreviewBoundingBox = (props: {
  displayArea: IKeyboardShapeDisplayArea;
}) => {
  const da = props.displayArea;
  const left = da.centerX - da.width / 2;
  const top = da.centerY - da.height / 2;
  const { width, height } = da;
  return (
    <rect
      x={left}
      y={top}
      width={width}
      height={height}
      stroke="#0F0"
      fill="transparent"
    />
  );
};