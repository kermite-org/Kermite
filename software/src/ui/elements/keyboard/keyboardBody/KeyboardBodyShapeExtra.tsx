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
  const transform = `translate(${shape.x},${shape.y}) scale(${shape.scale})`;
  const style = css`
    fill: ${fillColor};
    stroke: ${strokeColor};
  `;
  return (
    <g transform={transform}>
      <path d={shape.path} class={style} />
    </g>
  );
};
