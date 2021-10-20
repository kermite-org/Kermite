import { css, FC, jsx } from 'qx';
import { IDisplayKeyboardDesign } from '~/shared';
import { KeyboardSvgFrameWithAutoScaler } from '~/ui/components/keyboard/frames/KeyboardSvgFrameWithAutoScaler';
import { KeyboardBodyShape } from '~/ui/components/keyboard/keyboardBody/KeyboardBodyShape';
import { IDraftLayoutLabelEntity } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPartTypes';
import { CoordOriginMark } from '~/ui/features/ProjectQuickSetupPart/parts/CoordOriginMark';
import { LayoutPreviewKeyEntityCard } from '~/ui/features/ProjectQuickSetupPart/parts/LayoutPreviewShpaeView.KeyEntityCard';

type Props = {
  keyboardDesign: IDisplayKeyboardDesign;
  labelEntities: IDraftLayoutLabelEntity[];
  holdKeyIndices: number[];
};

export const LayoutPreviewShapeView: FC<Props> = ({
  keyboardDesign,
  labelEntities,
  holdKeyIndices,
}) => {
  const dpiScale = 2;
  const marginRatio = 0.1;
  const baseStrokeWidth = 0.3;

  const fillColor = '#54566f';
  const strokeColor = 'transparent';
  return (
    <div css={style}>
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
        <g>
          {keyboardDesign.keyEntities.map((ke) => (
            <LayoutPreviewKeyEntityCard
              keyEntity={ke}
              labelEntities={labelEntities.filter(
                (it) => it.keyId === ke.keyId,
              )}
              key={ke.keyId}
              isHold={holdKeyIndices.includes(ke.keyIndex)}
            />
          ))}
        </g>
        <CoordOriginMark />
      </KeyboardSvgFrameWithAutoScaler>
    </div>
  );
};

const style = css`
  background: #eee;
  height: 100%;
  overflow: hidden;
`;
