import { FC, jsx } from 'qx';
import { CommonPageFrame } from '~/ui/components';
import { ProjectSelectionPart } from '~/ui/features';

export const ProjectSelectionPage: FC = () => (
  <CommonPageFrame pageTitle="Keyboard Product Selection">
    <ProjectSelectionPart />
  </CommonPageFrame>
);
