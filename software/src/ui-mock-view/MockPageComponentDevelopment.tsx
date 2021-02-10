import { css, setup } from 'goober';
import { h, FC } from 'qx';
import { uiTheme } from '~/ui-common';

setup(h);

const cssRoot = css`
  height: 100%;
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clForegroud};
  padding: 10px;
`;

export const MockPageComponentDevelopment: FC = () => {
  return <div css={cssRoot}>hello</div>;
};
