import { FC, jsx, useMemo } from 'qx';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { firmwareFlashPageContentStore } from '~/ui/pageContent/FirmwareFlashPageContent/store';
import { FirmwareFlashPageContent } from '~/ui/pageContent/FirmwareFlashPageContent/view';

export const ProjectQuickSetupPart_StepFirmwareFlash: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();
  const projectInfo = useMemo(
    () => projectQuickSetupStore.readers.emitDraftProjectInfo(),
    [],
  );
  firmwareFlashPageContentStore.configure(projectInfo, '01');
  return <FirmwareFlashPageContent />;
};
