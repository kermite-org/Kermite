import { jsx, css, FC } from 'qx';
import { IDisplayKeyboardDesign, IDisplayKeyEntity } from '~/shared';
import { uiTheme } from '~/ui/base';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/components_svg/frames/KeyboardSvgFrameWithAutoScaler';
import { ProjectKeyEntityCard } from '~/ui/components_svg/keyUnitCards/ProjectKeyEntityCard';
import { KeyboardBodyShape } from '~/ui/components_svg/keyboardBody/KeyboardBodyShape';
import { PreviewDisplayAreaBox } from '~/ui/components_svg/keyboardBody/PreviewBoundingBox';

type Props = {
  keyboardDesign: IDisplayKeyboardDesign;
  settings: {
    shapeViewShowKeyId: boolean;
    shapeViewShowKeyIndex: boolean;
    shapeViewShowBoundingBox: boolean;
  };
};

export const ProjectKeyboardShapeView: FC<Props> = ({
  keyboardDesign,
  settings,
}) => {
  const showBoundingBox = settings.shapeViewShowBoundingBox;

  const showKeyId = settings.shapeViewShowKeyId;
  const showKeyIndex = settings.shapeViewShowKeyIndex;

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
        <ProjectKeyEntityCardsPart
          keyEntities={keyboardDesign.keyEntities}
          showKeyId={showKeyId}
          showKeyIndex={showKeyIndex}
        />
        <PreviewDisplayAreaBox
          dispalyArea={keyboardDesign.displayArea}
          qxIf={showBoundingBox}
        />
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
};

const cssKeyboardShapeView = css`
  height: 100%;
`;

const ProjectKeyEntityCardsPart = (props: {
  keyEntities: IDisplayKeyEntity[];
  showKeyId: boolean;
  showKeyIndex: boolean;
}) => (
  <g>
    {props.keyEntities.map((ke) => (
      <ProjectKeyEntityCard keyEntity={ke} key={ke.keyId} />
    ))}
  </g>
);
