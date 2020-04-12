import { KeyboardBasePlane } from './KeyboardBasePlane';
import { KeyUnitCardsPart } from './KeyUnitCards';
import { css } from 'goober';
import { ScalerBox } from './ScalerBox';
import { hx } from '~views/basis/qx';
import { editorModule } from '~models/core/EditorModule';

export const KeyboardBodyShape = () => {
  const outerPaths = editorModule.bodyPathMarkupText;
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
