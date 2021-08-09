import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';

export const ProjectEditPage: FC = () => {
  return <div css={style}>project edit page</div>;
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;
`;
