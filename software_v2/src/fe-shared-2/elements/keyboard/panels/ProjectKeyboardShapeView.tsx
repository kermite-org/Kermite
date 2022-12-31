import { FC, css, jsx } from 'alumina';
import { IDisplayKeyEntity, IDisplayKeyboardLayout } from '~/app-shared';
import { colors, getKeyboardSvgViewBoxSpec } from '~/fe-shared';
import { ProjectKeyEntityCard } from '../keyUnitCards';
import { KeyboardBodyShape, KeyboardBodyShapeExtra } from '../keyboardBody';

type Props = {
  keyboardDesign: IDisplayKeyboardLayout;
};

export const ProjectKeyboardShapeView: FC<Props> = ({ keyboardDesign }) => {
  const baseStrokeWidth = 0.5;
  const bodyFillColor = colors.projectKeyboard_bodyFill;
  const bodyStrokeColor = colors.projectKeyboard_bodyEdge;
  const { displayArea, keyEntities, outlineShapes, extraShapes } =
    keyboardDesign;
  return (
    <div class={cssKeyboardShapeView}>
      <svg viewBox={getKeyboardSvgViewBoxSpec(displayArea)}>
        <g stroke-width={baseStrokeWidth} stroke-linejoin="round">
          <KeyboardBodyShape
            outlineShapes={outlineShapes}
            fillColor={bodyFillColor}
            strokeColor={bodyStrokeColor}
          />
          <KeyboardBodyShapeExtra
            shapes={extraShapes}
            fillColor={bodyFillColor}
            strokeColor={bodyStrokeColor}
          />
          <ProjectKeyEntityCardsPart keyEntities={keyEntities} />
        </g>
      </svg>
    </div>
  );
};

const cssKeyboardShapeView = css`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  > svg {
    width: 100%;
    height: 100%;
    user-select: none;
  }
`;

const ProjectKeyEntityCardsPart = (props: {
  keyEntities: IDisplayKeyEntity[];
}) => (
  <g>
    {props.keyEntities.map((ke) => (
      <ProjectKeyEntityCard keyEntity={ke} key={ke.keyId} />
    ))}
  </g>
);
