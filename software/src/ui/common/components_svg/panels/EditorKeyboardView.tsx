import { jsx } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { uiTheme } from '~/ui/common/base';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/common/components_svg/frames/KeyboardSvgFrameWithAutoScaler';
import {
  EditKeyUnitCard,
  IEditKeyUnitCardViewModel,
} from '~/ui/common/components_svg/keyUnitCards/EditKeyUnitCard';
import { KeyboardBodyShape } from '~/ui/common/components_svg/keyboardBody/KeyboardBodyShape';

const EditKeyUnitCardsPart = (props: {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
}) => (
  <g>
    {props.cards.map((keyUnit) => (
      <EditKeyUnitCard
        keyUnit={keyUnit}
        key={keyUnit.keyUnitId}
        showLayerDefaultAssign={props.showLayerDefaultAssign}
      />
    ))}
  </g>
);

export const EditorKeyboardView = (props: {
  cards: IEditKeyUnitCardViewModel[];
  showLayerDefaultAssign: boolean;
  design: IDisplayKeyboardDesign;
}) => {
  const bodyFillColor = uiTheme.colors.clKeyboardBodyFace;

  const dpiScale = 2;
  const marginRatio = 0.06;
  const baseStrokeWidth = 0.3;
  return (
    <KeyboardSvgFrameWithAutoScaler
      displayArea={props.design.displayArea}
      dpiScale={dpiScale}
      marginRatio={marginRatio}
      baseStrokeWidth={baseStrokeWidth}
    >
      <KeyboardBodyShape
        outlineShapes={props.design.outlineShapes}
        fillColor={bodyFillColor}
        strokeColor="transparent"
      />
      <EditKeyUnitCardsPart
        cards={props.cards}
        showLayerDefaultAssign={props.showLayerDefaultAssign}
      />
    </KeyboardSvgFrameWithAutoScaler>
  );
};
