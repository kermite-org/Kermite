import { css } from 'goober';
import { h } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { IUiSettings } from '~/ui-common/models/UiStatusModel';
import { KeyboardBodyShape } from '~/ui-common/parts/keyboardSvg/KeyboardBodyShape';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui-common/parts/keyboardSvg/outlines/KeyboardSvgFrameWithAutoScaler';
import { PreviewDisplayAreaBox } from '~/ui-root/zones/common/parts/keyboardSvg/atoms/PreviewBoundingBox';
import { PreviewKeyEntityCardsPart } from '~/ui-root/zones/common/parts/keyboardSvg/organisms/PreviewKeyUnitCardsPart';

export function PreviewKeyboardShapeView(props: {
  keyboardDesign: IDisplayKeyboardDesign;
  settings: IUiSettings;
}) {
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
}
