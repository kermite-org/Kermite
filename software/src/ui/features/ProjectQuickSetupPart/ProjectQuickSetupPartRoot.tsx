import { FC, jsx } from 'qx';
import { ProjectQuickSetupPart_StepFirmwareConfig } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareConfig';
import { ProjectQuickSetupPart_StepFirmwareFlash } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepFirmwareFlash';
import { ProjectQuickSetupPart_StepLayoutConfig } from '~/ui/features/ProjectQuickSetupPart/ProjectQuickSetupPart_StepLayoutConfig';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { AssignerPage } from '~/ui/pages/assigner-page';
import { uiReaders } from '~/ui/store';

export const ProjectQuickSetupPartRoot: FC = () => {
  projectQuickSetupStore.effects.useEditDataPersistence();
  const { pagePath } = uiReaders;
  const subPath = pagePath.split('/')[2];
  if (subPath === 'step1') {
    return <ProjectQuickSetupPart_StepFirmwareConfig />;
  } else if (subPath === 'step2') {
    return <ProjectQuickSetupPart_StepFirmwareFlash />;
  } else if (subPath === 'step3') {
    return <ProjectQuickSetupPart_StepLayoutConfig />;
  } else if (subPath === 'step4') {
    return <AssignerPage />;
  }
  return null;
};
