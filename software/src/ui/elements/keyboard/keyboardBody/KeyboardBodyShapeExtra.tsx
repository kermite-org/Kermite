import { jsx, css, FC } from 'alumina';
import { IExtraShapeDefinition, validateSvgPathText } from '~/shared';

type Props = {
  shape: IExtraShapeDefinition | undefined;
  fillColor: string;
  strokeColor: string;
};

export const KeyboardBodyShapeExtra: FC<Props> = ({
  shape,
  fillColor,
  strokeColor,
}) => {
  if (!shape) {
    return undefined;
  }
  if (!validateSvgPathText(shape.path)) {
    return undefined;
  }
  const scx = shape.scale;
  const scy = shape.scale * (shape.invertY ? -1 : 1);
  const transform = `translate(${shape.x},${shape.y}) scale(${scx},${scy})`;
  const strokeWidth = shape.scale !== 0 ? 0.5 / shape.scale : 0.5;

  const style = css`
    fill: ${fillColor};
    stroke: ${strokeColor};
    stroke-width: ${strokeWidth};
  `;
  return (
    <g transform={transform}>
      <path d={shape.path} class={style} />
    </g>
  );
};
