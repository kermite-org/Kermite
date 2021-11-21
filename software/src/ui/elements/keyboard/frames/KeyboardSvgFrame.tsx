import { jsx, css, AluminaChildren, FC } from 'alumina';
import { IDisplayArea } from '~/shared';
import { getKeyboardSvgViewBoxSpec } from '~/ui/base';

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
