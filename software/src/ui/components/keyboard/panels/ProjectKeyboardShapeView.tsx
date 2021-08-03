import { css, FC, jsx } from 'qx';
import { IDisplayKeyboardDesign, IDisplayKeyEntity } from '~/shared';
import { uiTheme } from '~/ui/base';
import { getKeyboardSvgViewBoxSpec } from '~/ui/base/UiDomainHelpers';
import { ProjectKeyEntityCard } from '~/ui/components/keyboard/keyUnitCards';
import { KeyboardBodyShape } from '~/ui/components/keyboard/keyboardBody';

type Props = {
  className?: string;
  keyboardDesign: IDisplayKeyboardDesign;
};

export const ProjectKeyboardShapeView: FC<Props> = ({
  className,
  keyboardDesign,
}) => {
  const baseStrokeWidth = 0.5;
  const bodyFillColor = uiTheme.colors.projectKeyboard_bodyFill;
  const bodyStrokeColor = uiTheme.colors.projectKeyboard_bodyEdge;
  const { displayArea, keyEntities, outlineShapes } = keyboardDesign;
  return (
    <div css={cssKeyboardShapeView} className={className}>
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
