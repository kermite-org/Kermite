import { FC, jsx } from 'qx';
import { CommonPageFrame } from '~/ui/components';
import { ProjectResourcesPart } from '~/ui/features/ProjectResourcesPart/ProjectResourcesPart';

export const ProjectResourcePage: FC = () => {
  return (
    <CommonPageFrame pageTitle="Project Resource Edit Page">
      <ProjectResourcesPart />
    </CommonPageFrame>
  );
};
