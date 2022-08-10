import { css, FC, jsx } from 'alumina';
import { IExtraShapeDefinition, validateSvgPathText } from '~/shared';
import { makeCssColor } from '~/ui/base';

export const ExtraShapeView: FC<{ shape: IExtraShapeDefinition }> = ({
  shape,
}) => {
  if (!validateSvgPathText(shape.path)) {
    return undefined;
  }
  const transform = `translate(${shape.x},${shape.y}) scale(${shape.scale})`;
  return (
    <g transform={transform}>
      <path d={shape.path} class={cssKeyboardOutlineShapeView} />
    </g>
  );
};

const cssKeyboardOutlineShapeView = css`
  fill: none;
  stroke: ${makeCssColor(0xeeaacc, 0.7)};
  stroke-width: 0.5;
`;
