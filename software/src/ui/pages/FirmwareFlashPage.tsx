import { FC, jsx } from 'qx';
import { firmwareFlashPageContentStore } from '~/ui/pageContent/FirmwareFlashPageContent/store';
import { FirmwareFlashPageContent } from '~/ui/pageContent/FirmwareFlashPageContent/view';
import { uiReaders } from '~/ui/store';

export const FirmwareFlashPage: FC = () => {
  const projectInfo = uiReaders.allProjectPackageInfos.find(
    (it) => it.projectKey === uiReaders.globalProjectKey,
  )!;
  firmwareFlashPageContentStore.configure(projectInfo, undefined);
  return <FirmwareFlashPageContent />;
};
