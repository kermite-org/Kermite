import { css } from 'goober';
import { h } from 'qx';
import { ViewModelProps } from '~/ui-common/helpers';
import { KeyboardBodyShape } from '~/ui-root/zones/common/parts/keyboardSvg/atoms/KeyboardBodyShape';
import { PresetKeyUnitCard } from '~/ui-root/zones/common/parts/keyboardSvg/molecules/PresetKeyUnitCard';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui-root/zones/common/parts/keyboardSvg/outlines/KeyboardSvgFrameWithAutoScaler';
import { IPresetKeyboardViewModel } from '~/ui-root/zones/presetBrowser/viewModels/PresetKeyboardViewModel';

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
