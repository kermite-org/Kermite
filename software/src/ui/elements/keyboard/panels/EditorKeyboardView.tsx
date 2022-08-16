import { FC, jsx } from 'alumina';
import { IDisplayKeyboardDesign } from '~/shared';
import { IEditKeyUnitCardViewModel, colors } from '~/ui/base';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/elements/keyboard/frames/KeyboardSvgFrameWithAutoScaler';
import { EditKeyUnitCard } from '~/ui/elements/keyboard/keyUnitCards/EditKeyUnitCard';
import { KeyboardBodyShapeExtra } from '~/ui/elements/keyboard/keyboardBody';
import { KeyboardBodyShape } from '~/ui/elements/keyboard/keyboardBody/KeyboardBodyShape';

type Props = {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
  design: IDisplayKeyboardDesign;
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
        shape={design.extraShape}
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
