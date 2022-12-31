import { FC, jsx } from 'alumina';
import {
  IDisplayKeyboardLayout,
  IEditKeyUnitCardViewModel,
  colors,
} from '~/app-shared';
import { KeyboardSvgFrameWithAutoScaler } from '../frames';
import { EditKeyUnitCard } from '../keyUnitCards';
import { KeyboardBodyShape, KeyboardBodyShapeExtra } from '../keyboardBody';

type Props = {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
  design: IDisplayKeyboardLayout;
};

export const EditorKeyboardView: FC<Props> = ({
  cards,
  showLayerDefaultAssign,
  design,
}) => {
  const bodyFillColor = colors.clKeyboardBodyFace;
  const dpiScale = 2;
  const marginRatio = 0.06;
  const baseStrokeWidth = 0.3;
  return (
    <KeyboardSvgFrameWithAutoScaler
      displayArea={design.displayArea}
      dpiScale={dpiScale}
      marginRatio={marginRatio}
      baseStrokeWidth={baseStrokeWidth}
    >
      <KeyboardBodyShape
        outlineShapes={design.outlineShapes}
        fillColor={bodyFillColor}
        strokeColor="transparent"
      />
      <KeyboardBodyShapeExtra
        shapes={design.extraShapes}
        fillColor={bodyFillColor}
        strokeColor="transparent"
      />
      <EditKeyUnitCardsPart
        cards={cards}
        showLayerDefaultAssign={showLayerDefaultAssign}
        showOutline={design.outlineShapes.length === 0}
      />
    </KeyboardSvgFrameWithAutoScaler>
  );
};

const EditKeyUnitCardsPart = (props: {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
  showOutline: boolean;
}) => (
  <g>
    {props.cards.map((keyUnit) => (
      <EditKeyUnitCard
        keyUnit={keyUnit}
        key={keyUnit.keyUnitId}
        showLayerDefaultAssign={props.showLayerDefaultAssign}
        showOutline={props.showOutline}
      />
    ))}
  </g>
);
