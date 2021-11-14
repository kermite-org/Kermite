import { FC, jsx } from 'alumina';
import { CommonPageFrame } from '~/ui/components';
import { ProjectSelectionPart } from '~/ui/features';

export const ProjectSelectionPage: FC = () => (
  <CommonPageFrame pageTitle="Keyboard Product Selection">
    <ProjectSelectionPart />
  </CommonPageFrame>
);
