import { jsx, css } from 'qx';
import { IDisplayKeyboardDesign, IDisplayKeyEntity } from '~/shared';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/components_svg/frames/KeyboardSvgFrameWithAutoScaler';
import { PreviewKeyEntityCard } from '~/ui/components_svg/keyUnitCards/PreviewKeyUnitCard';
import { KeyboardBodyShape } from '~/ui/components_svg/keyboardBody/KeyboardBodyShape';
import { PreviewDisplayAreaBox } from '~/ui/components_svg/keyboardBody/PreviewBoundingBox';

const PreviewKeyEntityCardsPart = (props: {
  keyEntities: IDisplayKeyEntity[];
  showKeyId: boolean;
  showKeyIndex: boolean;
}) => (
  <g>
    {props.keyEntities.map((ke) => (
      <PreviewKeyEntityCard
        keyEntity={ke}
        key={ke.keyId}
        showKeyId={props.showKeyId}
        showKeyIndex={props.showKeyIndex}
      />
    ))}
  </g>
);

export const PreviewKeyboardShapeView = (props: {
  keyboardDesign: IDisplayKeyboardDesign;
  settings: {
    shapeViewShowKeyId: boolean;
    shapeViewShowKeyIndex: boolean;
    shapeViewShowBoundingBox: boolean;
  };
}) => {
  const { keyboardDesign, settings } = props;

  const cssKeyboardShapeView = css`
    background: #222;
    height: 100%;
    overflow: hidden;
  `;

  const showBoundingBox = settings.shapeViewShowBoundingBox;

  const showKeyId = settings.shapeViewShowKeyId;
  const showKeyIndex = settings.shapeViewShowKeyIndex;

  const dpiScale = 2;
  const marginRatio = 0.06;
  const baseStrokeWidth = 0.3;

  const fillColor = '#54566f';
  const strokeColor = 'transparent';
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
          fillColor={fillColor}
          strokeColor={strokeColor}
        />
        <PreviewKeyEntityCardsPart
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
