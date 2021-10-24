import { FC, jsx } from 'qx';
import { ProjectQuickSetupFirmwareFlashStepView } from '~/ui/pageContent/FirmwareFlashPageContent/ProjectQuickSetupFirmwareFlashStepView';
import { uiReaders } from '~/ui/store';

export const FirmwareFlashPage: FC = () => {
  const projectInfo = uiReaders.allProjectPackageInfos.find(
    (it) => it.projectKey === uiReaders.globalProjectKey,
  )!;
  return (
    <ProjectQuickSetupFirmwareFlashStepView
      projectInfo={projectInfo}
      fixedFirmwareVariationId=""
    />
  );
};
