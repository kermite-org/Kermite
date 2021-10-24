import { FC, jsx } from 'qx';
import { FirmwareFlashPageContent } from '~/ui/pageContent/FirmwareFlashPageContent/view';
import { uiReaders } from '~/ui/store';

export const FirmwareFlashPage: FC = () => {
  const projectInfo = uiReaders.allProjectPackageInfos.find(
    (it) => it.projectKey === uiReaders.globalProjectKey,
  )!;
  return (
    <FirmwareFlashPageContent
      projectInfo={projectInfo}
      fixedFirmwareVariationId={undefined}
    />
  );
};
