import { jsx, css, AluminaChildren, FC } from 'alumina';
import { IDisplayArea } from '~/app-shared';
import { KeyboardSvgFrame } from './KeyboardSvgFrame';
import { ScalerBox } from './ScalerBox';

type Props = {
  displayArea: IDisplayArea;
  children: AluminaChildren;
  dpiScale: number;
  marginRatio: number;
  baseStrokeWidth: number;
};

export const KeyboardSvgFrameWithAutoScaler: FC<Props> = ({
  displayArea,
  children,
  dpiScale,
  marginRatio,
  baseStrokeWidth,
}) => {
  const da = displayArea;
  const margin = Math.min(da.width, da.height) * marginRatio;
  const contentWidth = (da.width + margin * 2) * dpiScale;
  const contentHeight = (da.height + margin * 2) * dpiScale;

  return (
    <ScalerBox contentWidth={contentWidth} contentHeight={contentHeight}>
      <div class={cssScalerContent}>
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
};

export const cssScalerContent = css`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
