import { FC, jsx } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { uiTheme, IEditKeyUnitCardViewModel } from '~/ui/base';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/components/keyboard/frames/KeyboardSvgFrameWithAutoScaler';
import { EditKeyUnitCard } from '~/ui/components/keyboard/keyUnitCards/EditKeyUnitCard';
import { KeyboardBodyShape } from '~/ui/components/keyboard/keyboardBody/KeyboardBodyShape';

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
  const bodyFillColor = uiTheme.colors.clKeyboardBodyFace;
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
