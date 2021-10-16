import { css, FC, jsx } from 'qx';
import { uiTheme } from '~/ui/base';
import { RouteHeaderBar } from '~/ui/components';
import { ProjectQuickSetupPart } from '~/ui/features';

export const ProjectQuickSetupPage: FC = () => (
  <div className={style}>
    <RouteHeaderBar title="Project Quick Setup" backPagePath="/home" />
    <ProjectQuickSetupPart class="content" />
  </div>
);

const style = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  > .content {
    background: ${uiTheme.colors.clPanelBox};
  }
`;
