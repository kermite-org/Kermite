import { FC, jsx } from 'qx';
import { firmwareFlashPageContentStore } from '~/ui/pageContent/FirmwareFlashPageContent/store';
import { FirmwareFlashPageContent } from '~/ui/pageContent/FirmwareFlashPageContent/view';
import { uiReaders } from '~/ui/store';

export const FirmwareFlashPage: FC = () => {
  const targetDeviceSpec = {
    projectId: uiReaders.globalProjectId || '',
    firmwareVariationId: undefined,
  };
  firmwareFlashPageContentStore.configure(targetDeviceSpec);

  return <FirmwareFlashPageContent />;
};
