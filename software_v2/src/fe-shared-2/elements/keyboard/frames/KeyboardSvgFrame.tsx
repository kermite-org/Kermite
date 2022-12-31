import { AluminaChildren, FC, css, jsx } from 'alumina';
import { IDisplayArea } from '~/app-shared';
import { getKeyboardSvgViewBoxSpec } from '~/fe-shared';

type Props = {
  displayArea: IDisplayArea;
  dpiScale: number;
  children: AluminaChildren;
  baseStrokeWidth: number;
};

export const KeyboardSvgFrame: FC<Props> = ({
  displayArea,
  dpiScale,
  children,
  baseStrokeWidth,
}) => (
  <svg
    width={displayArea.width * dpiScale}
    height={displayArea.height * dpiScale}
    viewBox={getKeyboardSvgViewBoxSpec(displayArea)}
    class={style}
  >
    <g stroke-width={baseStrokeWidth} stroke-linejoin="round">
      {children}
    </g>
  </svg>
);

const style = css`
  user-select: none;
`;
