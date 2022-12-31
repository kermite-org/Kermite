import { FC, jsx } from 'alumina';
import { IDisplayArea } from '~/app-shared';

type Props = {
  displayArea: IDisplayArea;
};

export const PreviewDisplayAreaBox: FC<Props> = ({ displayArea }) => {
  const da = displayArea;
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
