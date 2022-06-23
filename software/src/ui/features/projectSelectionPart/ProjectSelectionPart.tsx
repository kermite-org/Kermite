import { FC, jsx, useEffect } from 'alumina';
import { ProjectSelectionPartComponent } from '~/ui/fabrics';
import { projectSelectionPartStore } from '~/ui/store/domains/projectSelectionPartStore/projectSelectionPartStore';

export const ProjectSelectionPart: FC = () => {
  useEffect(projectSelectionPartStore.initializeOnMount, []);
  const {
    readers: {
      sourceProjectItems,
      projectKey,
      canSelectResourceOrigin,
      resourceOriginSelectorSource,
      isMenuButtonVisible,
      menuItems,
      showNoSelectionOption,
    },
    actions: { setProjectKey },
  } = projectSelectionPartStore;

  return (
    <ProjectSelectionPartComponent
      sourceProjectItems={sourceProjectItems}
      projectKey={projectKey}
      canSelectResourceOrigin={canSelectResourceOrigin}
      resourceOriginSelectorSource={resourceOriginSelectorSource}
      isMenuButtonVisible={isMenuButtonVisible}
      menuItems={menuItems}
      showNoSelectionOption={showNoSelectionOption}
      setProjectKey={setProjectKey}
    />
  );
};
