import { jsx, css, FC } from 'qx';
import { IDisplayArea, IDisplayOutlineShape } from '~/shared';
import {
  IPresetKeyUnitViewModel,
  PresetKeyUnitCard,
} from '~/ui/common-svg/KeyUnitCards/PresetKeyUnitCard';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/common-svg/frames/KeyboardSvgFrameWithAutoScaler';
import { KeyboardBodyShape } from '~/ui/common-svg/keyboardBody/KeyboardBodyShape';

export type IPresetKeyboardViewProps = {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
};

const configs = {
  dpiScale: 2,
  marginRatio: 0.06,
  baseStrokeWidth: 1.0,
  fillColor: 'transparent',
  strokeColor: '#0A8',
};

const style = css`
  height: 100%;
  overflow: hidden;
`;

export const PresetKeyboardView: FC<IPresetKeyboardViewProps> = ({
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
