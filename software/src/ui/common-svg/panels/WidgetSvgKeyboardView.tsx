import { jsx, css } from 'qx';
import { IDisplayKeyboardDesign, linerInterpolateValue } from '~/shared';
import {
  IWidgetKeyUnitCardViewModel,
  WidgetKeyUnitCard,
} from '~/ui/common-svg/KeyUnitCards/WidgetKeyUnitCard';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/common-svg/frames/KeyboardSvgFrameWithAutoScaler';
import { KeyboardBodyShape } from '~/ui/common-svg/keyboardBody/KeyboardBodyShape';

export function WidgetSvgKeyboardView(props: {
  keyboardDesign: IDisplayKeyboardDesign;
  cards: IWidgetKeyUnitCardViewModel[];
}) {
  const { keyboardDesign, cards } = props;

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
        <g>
          {cards.map((keyUnit) => (
            <WidgetKeyUnitCard keyUnit={keyUnit} key={keyUnit.keyUnitId} />
          ))}
        </g>
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
}
