import { jsx } from 'qx';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { ProjectKeyboardList } from '~/ui/components/organisms/ProjectKeyboardList';
import {
  exampleData_persistKeyboardDesign_astelia,
  exampleData_persistKeyboardDesign_miniversRev2,
  exampleData_persistKeyboardDesign_shiro,
} from '~/ui/exampleData';

const convertDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign;

const projectItems: IProjectKeyboardListProjectItem[] = [
  {
    projectId: 'proj0',
    keyboardName: 'Astelia',
    design: convertDesign(exampleData_persistKeyboardDesign_astelia),
  },
  {
    projectId: 'proj1',
    keyboardName: 'Shiro',
    design: convertDesign(exampleData_persistKeyboardDesign_shiro),
  },
  {
    projectId: 'proj2',
    keyboardName: 'Minivers',
    design: convertDesign(exampleData_persistKeyboardDesign_miniversRev2),
  },
];

let curProjectId = 'proj0';

export const ProjectKeyboardListExamples = {
  default: () => (
    <ProjectKeyboardList
      projectItems={projectItems}
      currentProjectId={curProjectId}
      setCurrentProjectId={(id) => (curProjectId = id)}
    />
  ),
};
