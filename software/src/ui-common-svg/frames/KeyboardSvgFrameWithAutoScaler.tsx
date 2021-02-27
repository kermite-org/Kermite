import { h } from 'qx';
import { css } from 'qx/cssinjs';
import { IDisplayArea } from '~/shared';
import { KeyboardSvgFrame } from '~/ui-common-svg/frames/KeyboardSvgFrame';
import { ScalerBox } from '~/ui-common-svg/frames/ScalerBox';

export const cssScalerContent = css`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export function KeyboardSvgFrameWithAutoScaler(props: {
  displayArea: IDisplayArea;
  children: JSX.Element[];
  dpiScale: number;
  marginRatio: number;
  baseStrokeWidth: number;
}) {
  const {
    displayArea,
    children,
    dpiScale,
    marginRatio,
    baseStrokeWidth,
  } = props;
  const da = displayArea;
  const margin = Math.min(da.width, da.height) * marginRatio;
  const contentWidth = (da.width + margin * 2) * dpiScale;
  const contentHeight = (da.height + margin * 2) * dpiScale;

  return (
    <ScalerBox contentWidth={contentWidth} contentHeight={contentHeight}>
      <div css={cssScalerContent}>
        <KeyboardSvgFrame
          displayArea={displayArea}
          dpiScale={dpiScale}
          baseStrokeWidth={baseStrokeWidth}
        >
          {children}
        </KeyboardSvgFrame>
      </div>
    </ScalerBox>
  );
}
