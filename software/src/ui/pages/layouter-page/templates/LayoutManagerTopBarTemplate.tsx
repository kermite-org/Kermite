import { FC, jsx } from 'qx';
import { ProjectAttachmentFileSelectorModal } from '~/ui/components';
import { layoutManagerRootModel } from '~/ui/pages/layouter-page/models/LayoutManagerRootModel';
import { makeProjectLayoutSelectorModalModel } from '~/ui/pages/layouter-page/models/ProjectLayoutSelectorModalModel';
import { LayoutManagerTopBar } from '~/ui/pages/layouter-page/organisms/LayoutManagerTopBar';
import { useLayoutManagerTopBarModel } from '~/ui/pages/layouter-page/templates/LayoutManagerTopBarModel';

export const LayoutManagerTopBarTemplate: FC = () => {
  layoutManagerRootModel.updateBeforeRender();
  const modalModel = makeProjectLayoutSelectorModalModel();
  const topBarModel = useLayoutManagerTopBarModel();
  return (
    <div>
      <LayoutManagerTopBar {...topBarModel} />
      {modalModel && <ProjectAttachmentFileSelectorModal vm={modalModel} />}
    </div>
  );
};
