import { FC, jsx } from 'alumina';
import { ClosableOverlay, CommonDialogFrame } from '~/ui/components';
import { LayoutEditorCore } from '~/ui/featureEditors';
import { KicadImporterPanelContentRoot } from '~/ui/features';
import { diKicadImporter } from '~/ui/features/kicadImporter/base';
import { layoutManagerActions } from '~/ui/pages/layoutEditorPage/models/layoutManagerActions';

diKicadImporter.applyImportLayout = (design) => {
  LayoutEditorCore.replaceKeyboardDesign(design);
  layoutManagerActions.closeModal();
};

export const KicadImporterModal: FC = () => {
  const modalTitle = 'Import layout from Kicad PCB design file';

  const handleClose = layoutManagerActions.closeModal;
  return (
    <ClosableOverlay close={handleClose}>
      <CommonDialogFrame caption={modalTitle} close={handleClose}>
        <KicadImporterPanelContentRoot />
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};
