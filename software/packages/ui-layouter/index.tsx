import { model } from '@ui-layouter/model';
import { css } from 'goober';
import { h } from 'qx';

const cssUiLayouterComponent = css`
  border: solid 4px orange;
  background: #ff0;
  color: red;
`;

export const UiLayouterComponent = () => {
  const { version } = model;

  return <div css={cssUiLayouterComponent}>Layouter {version} </div>;
};
