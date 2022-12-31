import { FC, css, jsx } from 'alumina';
import { IDisplayKeyboardLayout, linerInterpolateValue } from '~/app-shared';
import { IWidgetKeyUnitCardViewModel } from '~/fe-shared';
import { KeyboardSvgFrameWithAutoScaler } from '../frames';
import { WidgetKeyUnitCard } from '../keyUnitCards';
import { KeyboardBodyShape, KeyboardBodyShapeExtra } from '../keyboardBody';

type Props = {
  keyboardDesign: IDisplayKeyboardLayout;
  cards: IWidgetKeyUnitCardViewModel[];
};

export const WidgetSvgKeyboardView: FC<Props> = ({ keyboardDesign, cards }) => {
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
    <div class={style}>
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
        <KeyboardBodyShapeExtra
          shapes={keyboardDesign.extraShapes}
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
};

const style = css`
  height: 100%;
  height: 100%;
  overflow: hidden;
`;
