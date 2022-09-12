import { FC, jsx } from 'alumina';
import { ClosableOverlay, CommonDialogFrame } from '~/ui/components';
import { KicadImporterPanelContentRoot } from '~/ui/features';
import { layoutManagerActions } from '~/ui/pages/layoutEditorPage/models/layoutManagerActions';

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
