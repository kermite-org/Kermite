import { jsx } from 'alumina';
import { DisplayKeyboardDesignLoader } from '~/shared';
import { IProjectKeyboardListProjectItem } from '~/ui/base';
import {
  exampleData_persistKeyboardDesign_astelia,
  exampleData_persistKeyboardDesign_miniversRev2,
  exampleData_persistKeyboardDesign_shiro,
} from '~/ui/constants';
import { ProjectKeyboardList } from '~/ui/fabrics/ProjectKeyboardList/ProjectKeyboardList';
import { ProjectKeyboardListProjectAddCard } from '~/ui/fabrics/ProjectKeyboardList/ProjectKeyboardList.ProjectAddCard';

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
      renderAdditionalItem={() => (
        <ProjectKeyboardListProjectAddCard onClick={() => {}} />
      )}
    />
  ),
};