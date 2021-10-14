import { css, FC, jsx } from 'qx';
import { CommonPageFrame } from '~/ui/components';
import { ProjectQuickSetupPart } from '~/ui/features';

export const ProjectQuickSetupPage: FC = () => (
  <CommonPageFrame
    pageTitle="Project Quick Setup"
    className={frameStyleOverride}
  >
    <ProjectQuickSetupPart />
  </CommonPageFrame>
);

const frameStyleOverride = css`
  padding: 5px;

  > .body {
    margin-top: 0;
  }
`;
