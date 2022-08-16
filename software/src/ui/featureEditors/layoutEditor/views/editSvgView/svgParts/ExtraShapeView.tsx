import { css, FC, jsx } from 'alumina';
import { IExtraShapeDefinition, validateSvgPathText } from '~/shared';
import { makeCssColor } from '~/ui/base';

export const ExtraShapeView: FC<{ shape: IExtraShapeDefinition }> = ({
  shape,
}) => {
  if (!validateSvgPathText(shape.path)) {
    return undefined;
  }
  const scx = shape.scale;
  const scy = shape.scale * (shape.invertY ? -1 : 1);
  const transform = `translate(${shape.x},${shape.y}) scale(${scx},${scy})`;

  const strokeWidth = shape.scale !== 0 ? 0.5 / shape.scale : 0.5;
  return (
    <g transform={transform}>
      <path
        d={shape.path}
        class={cssKeyboardOutlineShapeView}
        stroke-width={strokeWidth}
      />
    </g>
  );
};

const cssKeyboardOutlineShapeView = css`
  fill: none;
  stroke: ${makeCssColor(0xeeaacc, 0.7)};
`;
