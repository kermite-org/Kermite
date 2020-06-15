import { css } from 'goober';
import { h } from '~ui2/views/basis/qx';

import { IKeyboardShape } from '~defs/ProfileData';

const cssBase = css`
  background: #222;
  /* width: 400px; */
  height: 400px;
  padding: 10px;
`;

export function KeyboardShapeView(props: { shape: IKeyboardShape }) {
  const { shape } = props;
  return (
    <div css={cssBase}>
      <div>{shape && JSON.stringify(shape)}</div>
    </div>
  );
}
