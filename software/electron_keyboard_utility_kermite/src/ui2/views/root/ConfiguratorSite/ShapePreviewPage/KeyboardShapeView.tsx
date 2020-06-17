import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import {
  IKeyboardShape,
  IKeyboardShapeDisplayArea,
  IKeyUnitEntry
} from '~defs/ProfileData';
import { ScalerBox } from './ScalerBox';
import { KeyUnitCard } from './KeyUnitCard';

function getViewBox(da: IKeyboardShapeDisplayArea) {
  const left = da.centerX - da.width / 2;
  const top = da.centerY - da.height / 2;
  const { width, height } = da;
  return `${left} ${top} ${width} ${height}`;
}

const KeyboardSvgFrame = (props: {
  displayArea: IKeyboardShapeDisplayArea;
  dpiScale: number;
  children: JSX.Element[];
}) => {
  const cssSvgFrame = css`
    user-select: none;
  `;

  const { displayArea, dpiScale, children } = props;
  const viewBox = getViewBox(displayArea);

  return (
    <svg
      width={displayArea.width * dpiScale}
      height={displayArea.height * dpiScale}
      viewBox={viewBox}
      css={cssSvgFrame}
    >
      <g strokeWidth={0.3} strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
};

const KeyboardBodyShape = (props: { outerPaths: string }) => {
  const cssBody = css`
    fill: #54566f;
  `;
  return <path d={props.outerPaths} css={cssBody} />;
};

export const KeyUnitCardsPart = (props: { keyUnits: IKeyUnitEntry[] }) => {
  return (
    <g>
      {props.keyUnits.map((keyUnit) => (
        <KeyUnitCard
          keyUnit={keyUnit}
          key={keyUnit.id}
          qxOptimizer="deepEqual"
        />
      ))}
    </g>
  );
};

export function KeyboardShapeView(props: { shape: IKeyboardShape }) {
  const { shape } = props;
  const dpiScale = 2;
  const da = shape.displayArea;
  const marginRatio = 0.06;
  const margin = Math.min(da.width, da.height) * marginRatio;
  const contentWidth = (da.width + margin * 2) * dpiScale;
  const contentHeight = (da.height + margin * 2) * dpiScale;

  const cssKeyboardShapeView = css`
    background: #222;
    height: 100%;
    overflow: hidden;
  `;

  const cssScalerContent = css`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  return (
    <div css={cssKeyboardShapeView}>
      <ScalerBox contentWidth={contentWidth} contentHeight={contentHeight}>
        <div css={cssScalerContent}>
          <KeyboardSvgFrame displayArea={shape.displayArea} dpiScale={dpiScale}>
            <KeyboardBodyShape outerPaths={shape.bodyPathMarkupText} />
            <KeyUnitCardsPart keyUnits={shape.keyUnits} />
          </KeyboardSvgFrame>
        </div>
      </ScalerBox>
    </div>
  );
}
