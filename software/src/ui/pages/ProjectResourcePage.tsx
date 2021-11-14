import { FC, jsx } from 'alumina';
import { CommonPageFrame } from '~/ui/components';
import { ProjectResourcesPart } from '~/ui/features/ProjectResourcesPart/ProjectResourcesPart';

export const ProjectResourcePage: FC = () => {
  return (
    <CommonPageFrame pageTitle="Project Resource Edit Page">
      <ProjectResourcesPart />
    </CommonPageFrame>
  );
};
