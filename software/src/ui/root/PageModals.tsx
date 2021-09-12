import { FC, jsx } from 'qx';
import { uiActions, uiState } from '~/ui/commonStore';
import { ProjectCustomFirmwareSetupModal } from '~/ui/pages/ProjectCustomFirmwareSetupModal/ProjectCustomFirmwareSetupModal';

export const PageModals: FC = () => {
  const { pageModalSpec: modalSpec } = uiState;
  const close = uiActions.closePageModal;
  if (modalSpec) {
    if (modalSpec.type === 'projectCustomFirmwareSetup') {
      return (
        <ProjectCustomFirmwareSetupModal
          firmwareName={modalSpec.firmwareName}
          close={close}
        />
      );
    }
  }
  return null;
};
