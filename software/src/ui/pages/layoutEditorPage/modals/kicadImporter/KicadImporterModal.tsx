import { FC, jsx } from 'alumina';
import { ClosableOverlay, CommonDialogFrame } from '~/ui/components';
import { layoutManagerActions } from '~/ui/pages/layoutEditorPage/models/layoutManagerActions';

export const KicadImporterModal: FC = () => {
  const modalTitle = 'Import Layout from Kicad PCB Design';

  const handleClose = layoutManagerActions.closeModal;
  return (
    <ClosableOverlay close={handleClose}>
      <CommonDialogFrame caption={modalTitle} close={handleClose}>
        <div>kicad importer</div>
      </CommonDialogFrame>
    </ClosableOverlay>
  );
};
