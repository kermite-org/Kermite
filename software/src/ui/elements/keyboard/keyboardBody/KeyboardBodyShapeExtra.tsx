import { css, domStyled, FC, jsx } from 'alumina';
import { IDisplayExtraShape, validateSvgPathText } from '~/shared';

const KeyboardBodyShapeExtraSingle: FC<{
  shape: IDisplayExtraShape;
  fillColor: string;
  strokeColor: string;
}> = ({ shape, fillColor, strokeColor }) => {
  if (!validateSvgPathText(shape.path)) {
    return undefined;
  }
  const strokeWidth = 0.5 / shape.scaleForLineWeight;

  return domStyled(
    <path d={shape.path} />,
    css`
      fill: ${fillColor};
      stroke: ${strokeColor};
      stroke-width: ${strokeWidth};
    `,
  );
};

export const KeyboardBodyShapeExtra: FC<{
  shapes: IDisplayExtraShape[];
  fillColor: string;
  strokeColor: string;
}> = ({ shapes, fillColor, strokeColor }) => {
  return (
    <g>
      {shapes.map((shape, idx) => (
        <KeyboardBodyShapeExtraSingle
          key={idx}
          shape={shape}
          fillColor={fillColor}
          strokeColor={strokeColor}
        />
      ))}
    </g>
  );
};
