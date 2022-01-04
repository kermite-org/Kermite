import { css, FC, jsx } from 'alumina';
import { IDisplayKeyboardDesign, IDisplayKeyEntity } from '~/shared';
import { colors } from '~/ui/base';
import { getKeyboardSvgViewBoxSpec } from '~/ui/base/UiDomainHelpers';
import { ProjectKeyEntityCard } from '~/ui/elements/keyboard/keyUnitCards';
import { KeyboardBodyShape } from '~/ui/elements/keyboard/keyboardBody';

type Props = {
  keyboardDesign: IDisplayKeyboardDesign;
};

export const ProjectKeyboardShapeView: FC<Props> = ({ keyboardDesign }) => {
  const baseStrokeWidth = 0.5;
  const bodyFillColor = colors.projectKeyboard_bodyFill;
  const bodyStrokeColor = colors.projectKeyboard_bodyEdge;
  const { displayArea, keyEntities, outlineShapes } = keyboardDesign;
  return (
    <div css={cssKeyboardShapeView}>
      <svg viewBox={getKeyboardSvgViewBoxSpec(displayArea)}>
        <g stroke-width={baseStrokeWidth} stroke-linejoin="round">
          <KeyboardBodyShape
            outlineShapes={outlineShapes}
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
