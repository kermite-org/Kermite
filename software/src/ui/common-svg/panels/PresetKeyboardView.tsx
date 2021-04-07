import { jsx, css } from 'qx';
import { IDisplayArea, IDisplayOutlineShape } from '~/shared';
import {
  IPresetKeyUnitViewModel,
  PresetKeyUnitCard,
} from '~/ui/common-svg/KeyUnitCards/PresetKeyUnitCard';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/common-svg/frames/KeyboardSvgFrameWithAutoScaler';
import { KeyboardBodyShape } from '~/ui/common-svg/keyboardBody/KeyboardBodyShape';
import { ViewModelProps } from '~/ui/common/helpers';

export interface IPresetKeyboardViewModel {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
}

export const PresetKeyboardView = ({
  vm,
}: ViewModelProps<IPresetKeyboardViewModel>) => {
  const cssKeyboardShapeView = css`
    height: 100%;
    overflow: hidden;
  `;

  const dpiScale = 2;
  const marginRatio = 0.06;
  const baseStrokeWidth = 1.0;

  const fillColor = 'transparent';
  const strokeColor = '#0A8';

  return (
    <div css={cssKeyboardShapeView}>
      <KeyboardSvgFrameWithAutoScaler
        displayArea={vm.displayArea}
        dpiScale={dpiScale}
        marginRatio={marginRatio}
        baseStrokeWidth={baseStrokeWidth}
      >
        <KeyboardBodyShape
          outlineShapes={vm.outlineShapes}
          fillColor={fillColor}
          strokeColor={strokeColor}
        />
        <g>
          {vm.keyUnits.map((keyUnit) => (
            <PresetKeyUnitCard model={keyUnit} key={keyUnit.keyUnitId} />
          ))}
        </g>
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
};
