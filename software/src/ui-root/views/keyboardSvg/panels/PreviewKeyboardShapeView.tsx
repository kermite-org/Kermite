import { IKeyboardShape } from '@shared';
import { css } from 'goober';
import { h } from 'qx';
import { IUiSettings } from '~/models/UiStatusModel';
import { KeyboardBodyShape } from '~/views/keyboardSvg/atoms/KeyboardBodyShape';
import { PreviewBoundingBox } from '~/views/keyboardSvg/atoms/PreviewBoundingBox';
import { PreviewKeyUnitCardsPart } from '~/views/keyboardSvg/organisms/PreviewKeyUnitCardsPart';
import { KeyboardSvgFrameWithAutoScaler } from '../outlines/KeyboardSvgFrameWithAutoScaler';

export function PreviewKeyboardShapeView(props: {
  shape: IKeyboardShape;
  settings: IUiSettings;
}) {
  const { shape, settings } = props;

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
        displayArea={shape.displayArea}
        dpiScale={dpiScale}
        marginRatio={marginRatio}
        baseStrokeWidth={baseStrokeWidth}
      >
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
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
}
