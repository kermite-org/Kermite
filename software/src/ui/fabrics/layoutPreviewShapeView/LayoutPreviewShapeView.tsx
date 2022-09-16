import { css, FC, jsx } from 'alumina';
import { IDisplayKeyboardDesign } from '~/shared';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/elements/keyboard/frames/KeyboardSvgFrameWithAutoScaler';
import {
  KeyboardBodyShapeExtra,
  KeyboardBodyShape,
} from '~/ui/elements/keyboard/keyboardBody';
import { CoordOriginMark } from '~/ui/fabrics/layoutPreviewShapeView/CoordOriginMark';
import { LayoutPreviewKeyEntityCard } from '~/ui/fabrics/layoutPreviewShapeView/LayoutPreviewShapeView.KeyEntityCard';
import { IDraftLayoutLabelEntity } from '~/ui/fabrics/layoutPreviewShapeView/layoutPreviewShapeViewTypes';

type Props = {
  keyboardDesign: IDisplayKeyboardDesign;
  labelEntities: IDraftLayoutLabelEntity[];
  holdKeyIndices: number[];
  showLabels: boolean;
};

export const LayoutPreviewShapeView: FC<Props> = ({
  keyboardDesign,
  labelEntities,
  holdKeyIndices,
  showLabels,
}) => {
  const dpiScale = 2;
  const marginRatio = 0;
  const baseStrokeWidth = 0.3;

  const fillColor = '#54566f';
  const strokeColor = 'transparent';
  return (
    <div class={style}>
      <KeyboardSvgFrameWithAutoScaler
        displayArea={keyboardDesign.displayArea}
        dpiScale={dpiScale}
        marginRatio={marginRatio}
        baseStrokeWidth={baseStrokeWidth}
      >
        <KeyboardBodyShape
          outlineShapes={keyboardDesign.outlineShapes}
          fillColor={fillColor}
          strokeColor={strokeColor}
        />
        <KeyboardBodyShapeExtra
          shapes={keyboardDesign.extraShapes}
          fillColor={fillColor}
          strokeColor={strokeColor}
        />
        <g>
          {keyboardDesign.keyEntities.map((ke) => (
            <LayoutPreviewKeyEntityCard
              keyEntity={ke}
              labelEntities={labelEntities.filter(
                (it) => it.keyId === ke.keyId,
              )}
              key={ke.keyId}
              isHold={holdKeyIndices.includes(ke.keyIndex)}
              showLabels={showLabels}
            />
          ))}
        </g>
        <CoordOriginMark if={showLabels} />
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
};

const style = css`
  background: #eee;
  height: 100%;
  overflow: hidden;
`;
