import { jsx, css, FC } from 'alumina';
import { IDisplayKeyboardDesign, linerInterpolateValue } from '~/shared';
import { IWidgetKeyUnitCardViewModel } from '~/ui/base';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/elements/keyboard/frames/KeyboardSvgFrameWithAutoScaler';
import { WidgetKeyUnitCard } from '~/ui/elements/keyboard/keyUnitCards/WidgetKeyUnitCard';
import { KeyboardBodyShape } from '~/ui/elements/keyboard/keyboardBody/KeyboardBodyShape';

type Props = {
  keyboardDesign: IDisplayKeyboardDesign;
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
    <div css={style}>
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
};

const style = css`
  height: 100%;
  height: 100%;
  overflow: hidden;
`;
