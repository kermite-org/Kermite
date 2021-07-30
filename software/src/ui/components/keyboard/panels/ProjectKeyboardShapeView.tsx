import { jsx, css, FC } from 'qx';
import { IDisplayKeyboardDesign, IDisplayKeyEntity } from '~/shared';
import { uiTheme } from '~/ui/base';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/components/keyboard/frames/KeyboardSvgFrameWithAutoScaler';
import { ProjectKeyEntityCard } from '~/ui/components/keyboard/keyUnitCards/ProjectKeyEntityCard';
import { KeyboardBodyShape } from '~/ui/components/keyboard/keyboardBody/KeyboardBodyShape';

type Props = {
  keyboardDesign: IDisplayKeyboardDesign;
};

export const ProjectKeyboardShapeView: FC<Props> = ({ keyboardDesign }) => {
  const dpiScale = 2;
  const marginRatio = 0.06;
  const baseStrokeWidth = 0.3;

  const bodyFillColor = uiTheme.colors.projectKeyboard_bodyFill;
  const bodyStrokeColor = uiTheme.colors.projectKeyboard_bodyEdge;
  return (
    <div css={cssKeyboardShapeView}>
      <KeyboardSvgFrameWithAutoScaler
        displayArea={keyboardDesign.displayArea}
        dpiScale={dpiScale}
        marginRatio={marginRatio}
        baseStrokeWidth={baseStrokeWidth}
      >
        <KeyboardBodyShape
          outlineShapes={keyboardDesign.outlineShapes}
          fillColor={bodyFillColor}
          strokeColor={bodyStrokeColor}
        />
        <ProjectKeyEntityCardsPart keyEntities={keyboardDesign.keyEntities} />
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
};

const cssKeyboardShapeView = css`
  height: 100%;
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
