import { css, setup, styled } from 'goober';
import { h, FC } from 'qx';
import { uiTheme } from '~/ui-common';

setup(h);

const cssRoot = css`
  height: 100%;
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clForegroud};
  padding: 10px;
`;

const Header = styled('div')`
  color: ${uiTheme.colors.clPrimary};
  font-size: 18px;
`;

export const MockPageComponentDevelopment: FC = () => {
  return (
    <div css={cssRoot}>
      <Header>Configurations</Header>
    </div>
  );
};
