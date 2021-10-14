import { FC, jsx } from 'qx';
import { CommonPageFrame } from '~/ui/components';
import { ProjectQuickSetupPart } from '~/ui/features';

export const ProjectQuickSetupPage: FC = () => (
  <CommonPageFrame pageTitle="Project Quick Setup">
    <ProjectQuickSetupPart />
  </CommonPageFrame>
);
