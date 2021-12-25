import { css, FC, jsx, useLocal } from 'alumina';
import { CommonPageFrame } from '~/ui/components';
import { ProjectKeyboardList, ProjectResourceList } from '~/ui/fabrics';
import { ResourceItemDetailView } from '~/ui/features/ProjectResourcesPart/organisms/ResourceItemDetailView';
import { createProjectReviewPageStore } from '~/ui/pages/ProjectReviewPage/store';
import {
  projectReviewPageStoreContext,
  useProjectReviewPageStore,
} from '~/ui/pages/ProjectReviewPage/storeContext';

const ProjectReviewPageComponent: FC = () => {
  const {
    projectSelection: { projectItems, currentProjectKey, setCurrentProjectKey },
    projectResources: {
      readers: { resourceItemKeys, selectedItemKey },
      actions: { setSelectedItemKey, clearSelection },
    },
  } = useProjectReviewPageStore();

  return (
    <CommonPageFrame pageTitle="Project Review">
      <div class={style}>
        <ProjectKeyboardList
          class="keyboard-list"
          projectItems={projectItems}
          currentProjectKey={currentProjectKey}
          setCurrentProjectKey={setCurrentProjectKey}
        />

        <div class="main-row">
          <div class="left-column">
            <ProjectResourceList
              resourceItemKeys={resourceItemKeys}
              selectedItemKey={selectedItemKey}
              setSelectedItemKey={setSelectedItemKey}
              clearSelection={clearSelection}
            />
          </div>
          <div class="right-column">
            <ResourceItemDetailView
              selectedItemKey={selectedItemKey}
              if={!!selectedItemKey}
            />
          </div>
        </div>
      </div>
    </CommonPageFrame>
  );
};

const style = css`
  > .keyboard-list {
    height: 220px;
  }
  > .main-row {
    margin-top: 10px;
    display: flex;
    height: 400px;
    gap: 10px;

    > * {
      height: 100%;
    }
    > .left-column {
      width: 250px;
    }
    > .right-column {
      flex-grow: 1;
      border: solid 1px #888;
    }
  }
`;

export const ProjectReviewPage: FC = () => {
  const store = useLocal(createProjectReviewPageStore);
  store.updateOnRender();
  return (
    <projectReviewPageStoreContext.Provider value={store}>
      <ProjectReviewPageComponent />
    </projectReviewPageStoreContext.Provider>
  );
};
