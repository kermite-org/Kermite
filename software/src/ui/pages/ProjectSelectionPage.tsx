import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { ProjectSelectionPart } from '~/ui/features';

export const ProjectSelectionPage: FC = () => (
  <div css={style}>
    Keyboard Product Selection
    <ProjectSelectionPart />
  </div>
);

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 20px;
`;
