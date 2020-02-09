import { css, jsx } from '@emotion/core';
import { KeyboardShape } from '~ui/view/WidgetSite/KeyboardShape';

export const KeyboardBodyShape = () => {
  const cssBody = css`
    fill: #54566f;
  `;
  return <path d={KeyboardShape.keyboardBodyPathMarkup} css={cssBody} />;
};
