import { jsx, css, FC } from 'alumina';
import {
  IDisplayArea,
  IDisplayExtraShape,
  IDisplayOutlineShape,
} from '~/shared';
import { IPresetKeyUnitViewModel } from '~/ui/base';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/elements/keyboard/frames';
import { PresetKeyUnitCard } from '~/ui/elements/keyboard/keyUnitCards';
import {
  KeyboardBodyShape,
  KeyboardBodyShapeExtra,
} from '~/ui/elements/keyboard/keyboardBody';

type Props = {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
  extraShapes: IDisplayExtraShape[];
};

export type IPresetKeyboardViewProps = Props;

const configs = {
  dpiScale: 2,
  marginRatio: 0.06,
  baseStrokeWidth: 1.0,
  fillColor: 'transparent',
  strokeColor: '#0A8',
};

export const PresetKeyboardView: FC<Props> = ({
  keyUnits,
  displayArea,
  outlineShapes,
  extraShapes,
}) => (
  <div class={style}>
    <KeyboardSvgFrameWithAutoScaler
      displayArea={displayArea}
      dpiScale={configs.dpiScale}
      marginRatio={configs.marginRatio}
      baseStrokeWidth={configs.baseStrokeWidth}
    >
      <KeyboardBodyShape
        outlineShapes={outlineShapes}
        fillColor={configs.fillColor}
        strokeColor={configs.strokeColor}
      />
      <KeyboardBodyShapeExtra
        shapes={extraShapes}
        fillColor={configs.fillColor}
        strokeColor={configs.strokeColor}
      />
      <g>
        {keyUnits.map((keyUnit) => (
          <PresetKeyUnitCard model={keyUnit} key={keyUnit.keyUnitId} />
        ))}
      </g>
    </KeyboardSvgFrameWithAutoScaler>
  </div>
);

const style = css`
  height: 100%;
  overflow: hidden;
`;
