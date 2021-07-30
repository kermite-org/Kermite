import { jsx, css, FC } from 'qx';
import { IDisplayArea, IDisplayOutlineShape } from '~/shared';
import { IPresetKeyUnitViewModel } from '~/ui/base';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/components/keyboard/frames/KeyboardSvgFrameWithAutoScaler';
import { PresetKeyUnitCard } from '~/ui/components/keyboard/keyUnitCards/PresetKeyUnitCard';
import { KeyboardBodyShape } from '~/ui/components/keyboard/keyboardBody/KeyboardBodyShape';

type Props = {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
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
}) => (
  <div css={style}>
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
