import { css } from 'goober';
import { h } from '~lib/qx';
import { ViewModelProps } from '~ui/base/helper/mvvmHelpers';
import { IPresetKeyboardViewModel } from '~ui/viewModels/PresetKeyboardViewModel';
import { KeyboardBodyShape } from '~ui/views/keyboardSvg/atoms/KeyboardBodyShape';
import { PresetKeyUnitCard } from '~ui/views/keyboardSvg/molecules/PresetKeyUnitCard';
import { KeyboardSvgFrame } from '~ui/views/keyboardSvg/outlines/KeyboardSvgFrame';
import { ScalerBox } from '~ui/views/keyboardSvg/outlines/ScalerBox';

export const PresetKeyboardView = ({
  vm
}: ViewModelProps<IPresetKeyboardViewModel>) => {
  const dpiScale = 2;
  const da = vm.displayArea;
  const marginRatio = 0.06;
  const margin = Math.min(da.width, da.height) * marginRatio;
  const contentWidth = (da.width + margin * 2) * dpiScale;
  const contentHeight = (da.height + margin * 2) * dpiScale;

  const cssKeyboardShapeView = css`
    height: 100%;
    overflow: hidden;
  `;

  const cssScalerContent = css`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const fillColor = 'transparent';
  const strokeColor = '#0A8';
  return (
    <div css={cssKeyboardShapeView}>
      <ScalerBox contentWidth={contentWidth} contentHeight={contentHeight}>
        <div css={cssScalerContent}>
          <KeyboardSvgFrame displayArea={vm.displayArea} dpiScale={dpiScale}>
            <KeyboardBodyShape
              outerPaths={vm.bodyPathMarkupText}
              fillColor={fillColor}
              strokeColor={strokeColor}
            />
            <g>
              {vm.keyUnits.map((keyUnit) => (
                <PresetKeyUnitCard
                  model={keyUnit}
                  key={keyUnit.keyUnitId}
                  qxOptimizer="deepEqual"
                />
              ))}
            </g>
          </KeyboardSvgFrame>
        </div>
      </ScalerBox>
    </div>
  );
};
