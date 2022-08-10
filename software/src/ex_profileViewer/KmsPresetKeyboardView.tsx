import { jsx, css, FC } from 'alumina';
import {
  IPresetKeyUnitViewModel,
  KmsPresetKeyUnitCard,
} from '~/ex_profileViewer/KmsPresetKeyUnitCard';
import { kmsColors } from '~/ex_profileViewer/kmsColors';
import {
  IDisplayArea,
  IDisplayOutlineShape,
  IExtraShapeDefinition,
} from '~/shared';
import {
  KeyboardBodyShape,
  KeyboardBodyShapeExtra,
  KeyboardSvgFrameWithAutoScaler,
} from '~/ui/elements';

export type IPresetKeyboardViewProps = {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
  extraShape: IExtraShapeDefinition | undefined;
};

const configs = {
  dpiScale: 2,
  marginRatio: 0.06,
  baseStrokeWidth: 1.0,
  fillColor: 'transparent',
  strokeColor: kmsColors.shapeEdge,
};

const style = css`
  height: 100%;
  overflow: hidden;
`;

export const KmsPresetKeyboardView: FC<IPresetKeyboardViewProps> = ({
  keyUnits,
  displayArea,
  outlineShapes,
  extraShape,
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
        shape={extraShape}
        fillColor={configs.fillColor}
        strokeColor={configs.strokeColor}
      />
      <g>
        {keyUnits.map((keyUnit) => (
          <KmsPresetKeyUnitCard model={keyUnit} key={keyUnit.keyUnitId} />
        ))}
      </g>
    </KeyboardSvgFrameWithAutoScaler>
  </div>
);
