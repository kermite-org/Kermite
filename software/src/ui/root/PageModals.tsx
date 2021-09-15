import { FC, jsx } from 'qx';
import { uiActions, uiState } from '~/ui/commonStore';
import { ProjectCustomFirmwareEditPage } from '~/ui/pages';

export const PageModals: FC = () => {
  const { pageModalSpec: modalSpec } = uiState;
  const close = uiActions.closePageModal;
  if (modalSpec) {
    if (modalSpec.type === 'projectCustomFirmwareSetup') {
      return (
        <ProjectCustomFirmwareEditPage
          firmwareName={modalSpec.firmwareName}
          close={close}
        />
      );
    }
  }
  return null;
};
