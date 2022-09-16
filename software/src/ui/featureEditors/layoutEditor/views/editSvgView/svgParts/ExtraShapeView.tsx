import { css, domStyled, FC, jsx } from 'alumina';
import { validateSvgPathText } from '~/shared';
import { makeCssColor } from '~/ui/base';
import {
  editReader,
  IEditExtraShape,
} from '~/ui/featureEditors/layoutEditor/models';

const ExtraShapeViewSingle: FC<{
  shape: IEditExtraShape;
  isMirror: boolean;
}> = ({ shape, isMirror }) => {
  // outer transform
  const mirrorMultX = isMirror ? -1 : 1;
  const group = editReader.getTransGroupById(shape.groupId);
  const ox = (group ? group.x : 0) * mirrorMultX;
  const oy = group ? group.y : 0;
  const orot = (group ? group.angle : 0) * mirrorMultX;
  const osx = mirrorMultX;
  const outerTransformSpec = `translate(${ox}, ${oy}) rotate(${orot}) scale(${osx}, 1)`;

  // inner transform
  const scx = shape.scale;
  const scy = shape.scale * (shape.invertY ? -1 : 1);
  const innerTransformSpec = `translate(${shape.x},${shape.y}) scale(${scx},${scy})`;

  const strokeWidth = shape.scale !== 0 ? 0.5 / shape.scale : 0.5;
  return domStyled(
    <g transform={outerTransformSpec}>
      <g transform={innerTransformSpec}>
        <path d={shape.path} stroke-width={strokeWidth} />
      </g>
    </g>,
    css`
      fill: none;
      stroke: ${makeCssColor(0xeeaacc, 0.7)};
    `,
  );
};

export const ExtraShapeView: FC<{ shape: IEditExtraShape }> = ({ shape }) => {
  if (!validateSvgPathText(shape.path)) {
    return undefined;
  }
  const group = editReader.getTransGroupById(shape.groupId);
  if (group?.mirror) {
    return (
      <g>
        <ExtraShapeViewSingle shape={shape} isMirror={false} />
        <ExtraShapeViewSingle shape={shape} isMirror={true} />
      </g>
    );
  } else {
    return (
      <g>
        <ExtraShapeViewSingle shape={shape} isMirror={false} />
      </g>
    );
  }
};
