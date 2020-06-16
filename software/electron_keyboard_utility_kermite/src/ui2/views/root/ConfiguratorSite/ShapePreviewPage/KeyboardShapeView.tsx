import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';
import { IKeyboardShape } from '~defs/ProfileData';
import { ScalerBox } from './ScalerBox';

const cssBase = css`
  background: #222;
  height: 100%;
  overflow: hidden;
`;

const cssContent = css`
  border: solid 2px #0f0;
  width: 100%;
  height: 100%;
`;

export function KeyboardShapeView(props: { shape: IKeyboardShape }) {
  const { shape } = props;
  const sw = shape.displayArea.width;
  const sh = shape.displayArea.height;
  return (
    <div css={cssBase}>
      <ScalerBox contentWidth={sw} contentHeight={sh}>
        <div css={cssContent} />
      </ScalerBox>
    </div>
  );
}
