import { css } from 'goober';
import { h } from '~lib/qx';
import { IKeyboardShape } from '~defs/ProfileData';
import { IUiSettings } from '~ui/models/UiStatusModel';
import { KeyboardBodyShape } from '~ui/views/keyboardSvg/atoms/KeyboardBodyShape';
import { PreviewBoundingBox } from '~ui/views/keyboardSvg/atoms/PreviewBoundingBox';
import { KeyboardSvgFrame } from '~ui/views/keyboardSvg/frames/KeyboardSvgFrame';
import { ScalerBox } from '~ui/views/keyboardSvg/frames/ScalerBox';
import { PreviewKeyUnitCardsPart } from '~ui/views/keyboardSvg/organisms/PreviewKeyUnitCardsPart';

export function KeyboardShapeView(props: {
  shape: IKeyboardShape;
  settings: IUiSettings;
}) {
  const { shape, settings } = props;
  const dpiScale = 2;
  const da = shape.displayArea;
  const marginRatio = 0.06;
  const margin = Math.min(da.width, da.height) * marginRatio;
  const contentWidth = (da.width + margin * 2) * dpiScale;
  const contentHeight = (da.height + margin * 2) * dpiScale;

  const cssKeyboardShapeView = css`
    background: #222;
    height: 100%;
    overflow: hidden;
  `;

  const cssScalerContent = css`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const showBoundingBox = settings.shapeViewShowBoundingBox;

  const showKeyId = settings.shapeViewShowKeyId;
  const showKeyIndex = settings.shapeViewShowKeyIndex;

  const fillColor = '#54566f';
  const strokeColor = 'transparent';
  return (
    <div css={cssKeyboardShapeView}>
      <ScalerBox contentWidth={contentWidth} contentHeight={contentHeight}>
        <div css={cssScalerContent}>
          <KeyboardSvgFrame displayArea={shape.displayArea} dpiScale={dpiScale}>
            <KeyboardBodyShape
              outerPaths={shape.bodyPathMarkupText}
              fillColor={fillColor}
              strokeColor={strokeColor}
            />
            <PreviewKeyUnitCardsPart
              keyUnits={shape.keyUnits}
              showKeyId={showKeyId}
              showKeyIndex={showKeyIndex}
            />
            <PreviewBoundingBox
              displayArea={shape.displayArea}
              qxIf={showBoundingBox}
            />
          </KeyboardSvgFrame>
        </div>
      </ScalerBox>
    </div>
  );
}
