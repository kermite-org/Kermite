import { css } from 'goober';
import { ViewModelProps } from '~ui/base/helper/mvvmHelpers';
import { IRealtimeHeatmapKeyboardViewModel } from '~ui/viewModels/RealtimeHeatmapViewModel';
import { KeyboardBodyShape } from '~ui/views/keyboardSvg/atoms/KeyboardBodyShape';
import { HeatmapKeyUnitCard } from '~ui/views/keyboardSvg/molecules/HeatmapKeyUnitCard';
import { KeyboardSvgFrameWithAutoScaler } from '~ui/views/keyboardSvg/outlines/KeyboardSvgFrameWithAutoScaler';
import { h } from '~qx';

export const HeatmapKeyboardView = ({
  vm,
}: ViewModelProps<IRealtimeHeatmapKeyboardViewModel>) => {
  const cssKeyboardShapeView = css`
    height: 300px;
    overflow: hidden;
    background: #ccc;
  `;

  const dpiScale = 2;
  const marginRatio = 0.06;
  const baseStrokeWidth = 0.3;

  const fillColor = '#FFF';
  const strokeColor = '#888';

  return (
    <div css={cssKeyboardShapeView}>
      <KeyboardSvgFrameWithAutoScaler
        displayArea={vm.displayArea}
        dpiScale={dpiScale}
        marginRatio={marginRatio}
        baseStrokeWidth={baseStrokeWidth}
      >
        <KeyboardBodyShape
          outerPaths={vm.bodyPathMarkupText}
          fillColor={fillColor}
          strokeColor={strokeColor}
        />
        <g>
          {vm.cardsVM.map((keyUnit) => (
            <HeatmapKeyUnitCard
              model={keyUnit}
              key={keyUnit.keyUnitId}
              qxOptimizer="deepEqual"
            />
          ))}
        </g>
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
};
