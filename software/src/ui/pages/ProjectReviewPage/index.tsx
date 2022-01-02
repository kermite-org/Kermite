import { css, FC, jsx } from 'alumina';
import { CommonPageFrame } from '~/ui/components';
import { ProjectKeyboardList, ProjectResourceList } from '~/ui/fabrics';
import { ProjectResourceItemView } from '~/ui/fabrics/ProjectResourceItemView/ProjectResourceItemView';
import { createProjectReviewPageStore } from '~/ui/pages/ProjectReviewPage/store';
import {
  projectReviewPageStoreContext,
  useProjectReviewPageStore,
} from '~/ui/pages/ProjectReviewPage/storeContext';

const ProjectReviewPageComponent: FC = () => {
  const {
    projectSelection: {
      projectItems,
      currentProjectKey,
      setCurrentProjectKey,
      selectedProjectInfo,
    },
    projectResources: {
      readers: { resourceItemKeys, selectedItemKey },
      actions: { setSelectedItemKey, clearSelection, handleOpenDetail },
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
          if={projectItems.length > 0}
        />
        <div
          class="keyboard-list keyboard-list-dummy"
          if={projectItems.length === 0}
        >
          No auditing packages
        </div>
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
            <ProjectResourceItemView
              projectInfo={selectedProjectInfo}
              selectedItemKey={selectedItemKey}
              if={!!selectedItemKey}
              detailButtonText="Detail"
              onDetailButton={handleOpenDetail}
            />
          </div>
        </div>

        <div class="info-row" if={!!currentProjectKey}>
          package revision:
          {selectedProjectInfo.onlineProjectAttributes?.revision}
        </div>
      </div>
    </CommonPageFrame>
  );
};

const style = css`
  > .keyboard-list {
    height: 220px;
  }

  > .keyboard-list-dummy {
    background: #ccc;
    color: #444;
    padding: 10px;
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
  > .info-row {
    margin-top: 5px;
  }
`;

const store = createProjectReviewPageStore();
export const ProjectReviewPage: FC = () => {
  store.updateOnRender();
  return (
    <projectReviewPageStoreContext.Provider value={store}>
      <ProjectReviewPageComponent />
    </projectReviewPageStoreContext.Provider>
  );
};
