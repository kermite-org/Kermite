import { FC, jsx } from 'alumina';
import { ProjectSelectionPartComponent } from '~/ui/fabrics';
import { useProjectSelectionPartModel } from '~/ui/features/ProjectSelectionPart/models/ProjectSelectionPartModel';

export const ProjectSelectionPart: FC = () => {
  const model = useProjectSelectionPartModel();
  return <ProjectSelectionPartComponent {...model} />;
};
