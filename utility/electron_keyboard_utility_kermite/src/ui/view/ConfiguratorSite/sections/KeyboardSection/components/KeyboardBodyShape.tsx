import { css, jsx } from '@emotion/core';

export const KeyboardBodyShape = (props: { pathMarkupText: string }) => {
  const { pathMarkupText } = props;
  const cssBody = css`
    fill: #54566f;
  `;
  return <path d={pathMarkupText} css={cssBody} />;
};
