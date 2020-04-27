import { css } from 'goober';
import { hx } from '~ui2/views/basis/qx';
import { KeyUnitCardsPart } from './KeyUnitCardsPart';
import { ScalerBox } from './ScalerBox';
import { editorModel } from '~ui2/models/EditorModel';

export const KeyboardBasePlane = (props: { children: any }) => {
  const { clearAssignSlotSelection } = editorModel;
  const { children } = props;
  const cssSvg = css`
    user-select: none;
  `;
  return (
    <svg
      width="600"
      height="240"
      viewBox="-300 -120 600 240"
      css={cssSvg}
      onMouseDown={clearAssignSlotSelection}
    >
      <g
        transform="scale(2) translate(0, -53.5)"
        strokeWidth={0.3}
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
};

export const KeyboardBodyShape = () => {
  const outerPaths = editorModel.bodyPathMarkupText;
  const cssBody = css`
    fill: #54566f;
  `;
  return <path d={outerPaths} css={cssBody} />;
};

export function KeyboardSection() {
  return (
    <ScalerBox
      boxId="KeyboardSection_scalerBox"
      contentWidth={600}
      contentHeight={240}
    >
      <KeyboardBasePlane>
        <KeyboardBodyShape />
        <KeyUnitCardsPart />
      </KeyboardBasePlane>
    </ScalerBox>
  );
}
