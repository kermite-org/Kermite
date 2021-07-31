import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';

export const ProjectSelectionPage: FC = () => {
  return <div css={style}>Global Project Selection</div>;
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 10px;
  position: relative;
`;
