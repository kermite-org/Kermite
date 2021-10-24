import { FC, jsx, useMemo } from 'qx';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { ProjectQuickSetupFirmwareFlashStepView } from '~/ui/pageContent/FirmwareFlashPageContent/ProjectQuickSetupFirmwareFlashStepView';

export const ProjectQuickSetupPart_StepFirmwareFlash: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();
  const projectInfo = useMemo(
    () => projectQuickSetupStore.readers.emitDraftProjectInfo(),
    [],
  );
  return (
    <ProjectQuickSetupFirmwareFlashStepView
      projectInfo={projectInfo}
      fixedFirmwareVariationId="01"
    />
  );
};
