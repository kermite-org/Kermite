import { FC, jsx } from 'alumina';
import { ProjectAttachmentFileSelectorModal } from '~/ui/elements/featureModals';
import { layoutManagerRootModel } from '~/ui/pages/layoutEditorPage/models/layoutManagerRootModel';
import { makeProjectLayoutSelectorModalModel } from '~/ui/pages/layoutEditorPage/models/projectLayoutSelectorModalModel';
import { LayoutManagerTopBar } from '~/ui/pages/layoutEditorPage/organisms/LayoutManagerTopBar';
import { useLayoutManagerTopBarModel } from '~/ui/pages/layoutEditorPage/templates/layoutManagerTopBarModel';
import { LayoutUpdateModal } from '../modals/LayoutUpdateModal';
import { layoutManagerReader } from '../models/layoutManagerReaders';

export const LayoutManagerTopBarTemplate: FC = () => {
  layoutManagerRootModel.updateBeforeRender();
  const modalModel = makeProjectLayoutSelectorModalModel();
  const topBarModel = useLayoutManagerTopBarModel();

  const isLayoutUpdateModalVisible =
    layoutManagerReader.modalState === 'CopyFromProject';
  return (
    <div>
      <LayoutManagerTopBar {...topBarModel} />
      {modalModel && <ProjectAttachmentFileSelectorModal vm={modalModel} />}
      {isLayoutUpdateModalVisible && <LayoutUpdateModal />}
    </div>
  );
};
