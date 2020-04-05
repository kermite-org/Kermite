import { KeyboardBasePlane } from './KeyboardBasePlane';
import { KeyUnitCardsPart } from './KeyUnitCards';
import { css } from 'goober';
import { ScalerBox } from './ScalerBox';
import { hx } from '~views/basis/qx';
import { editorState } from '~models/core/EditorState';

export const KeyboardBodyShape = () => {
  const outerPaths = editorState.profileData.keyboardShape.bodyPathMarkupText;
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
