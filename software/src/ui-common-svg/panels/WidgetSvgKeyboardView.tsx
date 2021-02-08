import { css } from 'goober';
import { h } from 'qx';
import { IDisplayKeyboardDesign, linerInterpolateValue } from '~/shared';
import { IWidgetKeyUnitCardsPartViewModel } from '~/ui-common-svg/KeyUnitCardsPart/WidgetKeyUnitCardsPartViewModel';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui-common-svg/frames/KeyboardSvgFrameWithAutoScaler';
import { KeyboardBodyShape } from '~/ui-common-svg/keyboardBody/KeyboardBodyShape';
import { WidgetKeyUnitCardsPart } from '../KeyUnitCardsPart/WidgetKeyUnitCardsPart';

export function WidgetSvgKeyboardView(props: {
  keyboardDesign: IDisplayKeyboardDesign;
  cardsPartVM: IWidgetKeyUnitCardsPartViewModel;
}) {
  const { keyboardDesign, cardsPartVM } = props;

  const cssKeyboardShapeView = css`
    height: 100%;
    height: 100%;
    overflow: hidden;
  `;

  const dpiScale = 2;
  const marginRatio = 0.02;
  const baseStrokeWidth = linerInterpolateValue(
    window.innerWidth,
    900,
    200,
    0.25,
    0.6,
    true,
  );
  const fillColor = '#89C';
  const strokeColor = 'rgb(0, 0, 51)';
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
        <WidgetKeyUnitCardsPart vm={cardsPartVM} />
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
}
