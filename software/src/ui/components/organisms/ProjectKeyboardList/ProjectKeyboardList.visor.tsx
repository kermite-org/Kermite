import { jsx } from 'qx';
import { DisplayKeyboardDesignLoader } from '~/shared';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import { ProjectKeyboardList } from '~/ui/components/organisms/ProjectKeyboardList/ProjectKeyboardList';
import {
  exampleData_persistKeyboardDesign_astelia,
  exampleData_persistKeyboardDesign_miniversRev2,
  exampleData_persistKeyboardDesign_shiro,
} from '~/ui/constants';

const convertDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign;

const projectItems: IProjectKeyboardListProjectItem[] = [
  {
    projectKey: 'proj0',
    keyboardName: 'Astelia',
    design: convertDesign(exampleData_persistKeyboardDesign_astelia),
  },
  {
    projectKey: 'proj1',
    keyboardName: 'Shiro',
    design: convertDesign(exampleData_persistKeyboardDesign_shiro),
  },
  {
    projectKey: 'proj2',
    keyboardName: 'Minivers',
    design: convertDesign(exampleData_persistKeyboardDesign_miniversRev2),
  },
];

let curProjectKey = 'proj0';

export const ProjectKeyboardListExamples = {
  default: () => (
    <ProjectKeyboardList
      projectItems={projectItems}
      currentProjectKey={curProjectKey}
      setCurrentProjectKey={(key) => (curProjectKey = key)}
    />
  ),
};
