import { css } from 'goober';
import { h } from 'qx';
import { ViewModelProps } from '~/ui-common/helpers';
import { KeyboardBodyShape } from '~/ui-common/parts/keyboardSvg/KeyboardBodyShape';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui-common/parts/keyboardSvg/outlines/KeyboardSvgFrameWithAutoScaler';
import { IPresetKeyboardViewModel } from '~/ui-preset-browser-page/viewModels/PresetKeyboardViewModel';
import { PresetKeyUnitCard } from '~/ui-preset-browser-page/views/PresetKeyUnitCard';

export const PresetKeyboardView = ({
  vm,
}: ViewModelProps<IPresetKeyboardViewModel>) => {
  const cssKeyboardShapeView = css`
    height: 100%;
    overflow: hidden;
  `;

  const dpiScale = 2;
  const marginRatio = 0.06;
  const baseStrokeWidth = 0.3;

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
            <PresetKeyUnitCard
              model={keyUnit}
              key={keyUnit.keyUnitId}
              // qxOptimizer="deepEqual"
            />
          ))}
        </g>
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
};
