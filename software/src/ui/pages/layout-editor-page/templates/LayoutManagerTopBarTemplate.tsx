import { FC, jsx } from 'qx';
import { ProjectAttachmentFileSelectorModal } from '~/ui/elements/featureModals';
import { layoutManagerRootModel } from '~/ui/pages/layout-editor-page/models/LayoutManagerRootModel';
import { makeProjectLayoutSelectorModalModel } from '~/ui/pages/layout-editor-page/models/ProjectLayoutSelectorModalModel';
import { LayoutManagerTopBar } from '~/ui/pages/layout-editor-page/organisms/LayoutManagerTopBar';
import { useLayoutManagerTopBarModel } from '~/ui/pages/layout-editor-page/templates/LayoutManagerTopBarModel';

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
