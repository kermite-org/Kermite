import { jsx, css, FC } from 'alumina';
import { IDisplayKeyboardDesign, IDisplayKeyEntity } from '~/shared';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/elements/keyboard/frames/KeyboardSvgFrameWithAutoScaler';
import { PreviewKeyEntityCard } from '~/ui/elements/keyboard/keyUnitCards/PreviewKeyUnitCard';
import { KeyboardBodyShape } from '~/ui/elements/keyboard/keyboardBody/KeyboardBodyShape';
import { PreviewDisplayAreaBox } from '~/ui/elements/keyboard/keyboardBody/PreviewBoundingBox';

type Props = {
  keyboardDesign: IDisplayKeyboardDesign;
  settings: {
    shapeViewShowKeyId: boolean;
    shapeViewShowKeyIndex: boolean;
    shapeViewShowBoundingBox: boolean;
  };
};

export const PreviewKeyboardShapeView: FC<Props> = ({
  keyboardDesign,
  settings,
}) => {
  const showBoundingBox = settings.shapeViewShowBoundingBox;

  const showKeyId = settings.shapeViewShowKeyId;
  const showKeyIndex = settings.shapeViewShowKeyIndex;

  const dpiScale = 2;
  const marginRatio = 0.06;
  const baseStrokeWidth = 0.3;

  const fillColor = '#54566f';
  const strokeColor = 'transparent';
  return (
    <div css={cssKeyboardShapeView}>
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
        <PreviewKeyEntityCardsPart
          keyEntities={keyboardDesign.keyEntities}
          showKeyId={showKeyId}
          showKeyIndex={showKeyIndex}
        />
        <PreviewDisplayAreaBox
          displayArea={keyboardDesign.displayArea}
          if={showBoundingBox}
        />
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
};

const cssKeyboardShapeView = css`
  background: #222;
  height: 100%;
  overflow: hidden;
`;

const PreviewKeyEntityCardsPart = (props: {
  keyEntities: IDisplayKeyEntity[];
  showKeyId: boolean;
  showKeyIndex: boolean;
}) => (
  <g>
    {props.keyEntities.map((ke) => (
      <PreviewKeyEntityCard
        keyEntity={ke}
        key={ke.keyId}
        showKeyId={props.showKeyId}
        showKeyIndex={props.showKeyIndex}
      />
    ))}
  </g>
);
