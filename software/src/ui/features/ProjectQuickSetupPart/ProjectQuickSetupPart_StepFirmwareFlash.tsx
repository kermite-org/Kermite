import { FC, jsx } from 'qx';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { FirmwareFlashPageContent } from '~/ui/pageContent/FirmwareFlashPageContent/view';

export const ProjectQuickSetupPart_StepFirmwareFlash: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();
  return <FirmwareFlashPageContent />;
};
