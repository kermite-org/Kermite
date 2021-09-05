import { FC, jsx } from 'qx';
import { useProjectSelectionPartModel } from './ProjectSelectionPart.model';
import { ProjectSelectionPartView } from './ProjectSelectionPart.view';

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
