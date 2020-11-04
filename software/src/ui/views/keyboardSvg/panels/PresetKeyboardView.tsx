import { css } from 'goober';
import { h } from '~lib/qx';
import { IProfileData } from '~defs/ProfileData';
import { KeyboardBodyShape } from '~ui/views/keyboardSvg/atoms/KeyboardBodyShape';
import { KeyboardSvgFrame } from '~ui/views/keyboardSvg/frames/KeyboardSvgFrame';
import { ScalerBox } from '~ui/views/keyboardSvg/frames/ScalerBox';
import { PreviewKeyUnitCardsPart } from '~ui/views/keyboardSvg/organisms/PreviewKeyUnitCardsPart';

export const PresetKeyboardView = (props: { profileData: IProfileData }) => {
  const shape = props.profileData.keyboardShape;
  const dpiScale = 2;
  const da = shape.displayArea;
  const marginRatio = 0.06;
  const margin = Math.min(da.width, da.height) * marginRatio;
  const contentWidth = (da.width + margin * 2) * dpiScale;
  const contentHeight = (da.height + margin * 2) * dpiScale;

  const cssKeyboardShapeView = css`
    height: 100%;
    overflow: hidden;
  `;

  const cssScalerContent = css`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const fillColor = 'transparent';
  const strokeColor = '#0A8';
  return (
    <div css={cssKeyboardShapeView}>
      <ScalerBox contentWidth={contentWidth} contentHeight={contentHeight}>
        <div css={cssScalerContent}>
          <KeyboardSvgFrame displayArea={shape.displayArea} dpiScale={dpiScale}>
            <KeyboardBodyShape
              outerPaths={shape.bodyPathMarkupText}
              fillColor={fillColor}
              strokeColor={strokeColor}
            />
            <PreviewKeyUnitCardsPart
              keyUnits={shape.keyUnits}
              showKeyId={false}
              showKeyIndex={false}
            />
          </KeyboardSvgFrame>
        </div>
      </ScalerBox>
    </div>
  );
};
