import { css } from 'goober';
import { h } from '~lib/qx';

export const KeyboardBodyShape = (props: {
  outerPaths: string;
  fillColor: string;
  strokeColor: string;
}) => {
  const cssBody = css`
    fill: ${props.fillColor};
    stroke: ${props.strokeColor};
  `;
  return <path d={props.outerPaths} css={cssBody} />;
};
