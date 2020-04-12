import { css } from 'goober';
import { editorViewModel } from '~viewModels/EditorViewModel';
import { hx } from '~views/basis/qx';
import { KeyboardBasePlane } from './KeyboardBasePlane';
import { KeyUnitCardsPart } from './KeyUnitCards';
import { ScalerBox } from './ScalerBox';

export const KeyboardBodyShape = () => {
  const outerPaths = editorViewModel.keyboardPartViewModel.bodyPathMarkupText;
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
