import { KeyboardBasePlane } from './KeyboardBasePlane';
import { KeyUnitCardsPart } from './KeyUnitCards';
import { css } from 'goober';
import { ScalerBox } from './ScalerBox';
import { editorModel } from '~models/AppModel';
import { hx } from '~views/basis/qx';

export const KeyboardBodyShape = () => {
  const outerPaths = editorModel.profileData.keyboardShape.bodyPathMarkupText;
  const cssBody = css`
    fill: #54566f;
  `;
  return <path d={outerPaths} css={cssBody} />;
};

export function KeyboardSection2() {
  return (
    <ScalerBox
      boxId="KeyboardSection_scalerBox"
      contentWidth={600}
      contentHeight={240}
      children={
        <KeyboardBasePlane
          children={
            <g>
              <KeyboardBodyShape />
              <KeyUnitCardsPart />
            </g>
          }
        />
      }
    />
  );
}
