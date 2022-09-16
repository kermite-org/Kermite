import { FC, jsx } from 'alumina';
import { ProjectAttachmentFileSelectorModal } from '~/ui/elements/featureModals';
import { layoutManagerRootModel } from '~/ui/pages/layoutEditorPage/models/layoutManagerRootModel';
import { makeProjectLayoutSelectorModalModel } from '~/ui/pages/layoutEditorPage/models/projectLayoutSelectorModalModel';
import { LayoutManagerTopBar } from '~/ui/pages/layoutEditorPage/organisms/LayoutManagerTopBar';
import { useLayoutManagerTopBarModel } from '~/ui/pages/layoutEditorPage/templates/layoutManagerTopBarModel';
import { KicadImporterModal, LayoutUpdateModal } from '../modals';
import { layoutManagerReader } from '../models/layoutManagerReaders';

export const LayoutManagerTopBarTemplate: FC = () => {
  layoutManagerRootModel.updateBeforeRender();
  const modalModel = makeProjectLayoutSelectorModalModel();
  const topBarModel = useLayoutManagerTopBarModel();

  const isLayoutUpdateModalVisible =
    layoutManagerReader.modalState === 'CopyFromProject';
  const isKicadImporterModalVisible =
    layoutManagerReader.modalState === 'LoadKicadPcbShape';
  return (
    <div>
      <LayoutManagerTopBar {...topBarModel} />
      {modalModel && <ProjectAttachmentFileSelectorModal vm={modalModel} />}
      {isLayoutUpdateModalVisible && <LayoutUpdateModal />}
      {isKicadImporterModalVisible && <KicadImporterModal />}
    </div>
  );
};
