import { FC, jsx } from 'alumina';
import { ProjectAttachmentFileSelectorModal } from '~/ui/elements/featureModals';
import { layoutManagerRootModel } from '~/ui/pages/LayoutEditorPage/models/LayoutManagerRootModel';
import { makeProjectLayoutSelectorModalModel } from '~/ui/pages/LayoutEditorPage/models/ProjectLayoutSelectorModalModel';
import { LayoutManagerTopBar } from '~/ui/pages/LayoutEditorPage/organisms/LayoutManagerTopBar';
import { useLayoutManagerTopBarModel } from '~/ui/pages/LayoutEditorPage/templates/LayoutManagerTopBarModel';

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
