import { FC, jsx } from 'qx';
import { IDisplayArea } from '~/shared';

type Props = {
  dispalyArea: IDisplayArea;
};

export const PreviewDisplayAreaBox: FC<Props> = ({ dispalyArea }) => {
  const da = dispalyArea;
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
