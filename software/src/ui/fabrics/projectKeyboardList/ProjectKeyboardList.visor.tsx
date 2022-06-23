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
    onlineProjectAttrs: {
      authorDisplayName: 'yahiro',
      authorIconUrl:
        'https://dev.server.kermite.org/api/avatar/8c2e05fa-4809-4365-b891-6a942d298fd8',
      isOfficial: true,
      isDevelopment: false,
      revision: 0,
    },
  },
  {
    projectKey: 'proj1',
    keyboardName: 'Shiro',
    design: convertDesign(exampleData_persistKeyboardDesign_shiro),
    onlineProjectAttrs: {
      authorDisplayName: 'yahiro',
      authorIconUrl:
        'https://dev.server.kermite.org/api/avatar/8c2e05fa-4809-4365-b891-6a942d298fd8',
      isOfficial: false,
      isDevelopment: false,
      revision: 1,
    },
  },
  {
    projectKey: 'proj2',
    keyboardName: 'Shiro',
    design: convertDesign(exampleData_persistKeyboardDesign_shiro),
  },
  {
    projectKey: 'proj4',
    keyboardName: 'Minivers',
    design: convertDesign(exampleData_persistKeyboardDesign_miniversRev2),
  },
];

let curProjectKey = 'proj3';

export default {
  default: () => (
    <ProjectKeyboardList
      projectItems={projectItems}
      currentProjectKey={curProjectKey}
      setCurrentProjectKey={(key) => (curProjectKey = key)}
      renderAdditionalItem={() => (
        <ProjectKeyboardListProjectAddCard
          onClick={() => {}}
          onFileDrop={() => {}}
        />
      )}
    />
  ),
};
