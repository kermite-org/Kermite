import { jsx, css } from 'qx';
import { IDisplayArea, IDisplayOutlineShape } from '~/shared';
import {
  HeatmapKeyUnitCard,
  IHeatmapCustomKeyUnitViewModel,
} from '~/ui-common-svg/KeyUnitCards/HeatmapKeyUnitCard';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui-common-svg/frames/KeyboardSvgFrameWithAutoScaler';
import { KeyboardBodyShape } from '~/ui-common-svg/keyboardBody/KeyboardBodyShape';
import { ViewModelProps } from '~/ui-common/helpers';

export interface IRealtimeHeatmapKeyboardViewModel {
  cardsVM: IHeatmapCustomKeyUnitViewModel[];
  outlineShapes: IDisplayOutlineShape[];
  displayArea: IDisplayArea;
}

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
