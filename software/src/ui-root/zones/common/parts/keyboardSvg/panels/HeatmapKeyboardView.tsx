import { css } from 'goober';
import { h } from 'qx';
import { ViewModelProps } from '~/ui-common/helpers';
import { KeyboardBodyShape } from '~/ui-root/zones/common/parts/keyboardSvg/atoms/KeyboardBodyShape';
import { HeatmapKeyUnitCard } from '~/ui-root/zones/common/parts/keyboardSvg/molecules/HeatmapKeyUnitCard';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui-root/zones/common/parts/keyboardSvg/outlines/KeyboardSvgFrameWithAutoScaler';
import { IRealtimeHeatmapKeyboardViewModel } from '~/ui-root/zones/heatmap/RealtimeHeatmapViewModel';

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
          outlineShapes={vm.outlineShapes}
          fillColor={fillColor}
          strokeColor={strokeColor}
        />
        <g>
          {vm.cardsVM.map((keyUnit) => (
            <HeatmapKeyUnitCard
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
