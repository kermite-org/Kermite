import { FC, jsx } from 'qx';
import { useProjectSelectionPartModel } from '~/ui/features/ProjectSelectionPart/ProjectSelectionPart.model';
import { ProjectSelectionPartView } from '~/ui/features/ProjectSelectionPart/ProjectSelectionPart.view';

export const ProjectSelectionPart: FC = () => {
  const { sourceProjectItems, projectId, setProjectId } =
    useProjectSelectionPartModel();
  return (
    <ProjectSelectionPartView
      sourceProjectItems={sourceProjectItems}
      projectId={projectId}
      setProjectId={setProjectId}
    />
  );
};
