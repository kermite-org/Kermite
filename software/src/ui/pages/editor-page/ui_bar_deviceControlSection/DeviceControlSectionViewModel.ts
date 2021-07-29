import { ipcAgent } from '~/ui/base';
import { useDeviceStatusModel } from '~/ui/commonModels';
import { useFetcher } from '~/ui/helpers';

export function makeDeviceControlSectionViewModel() {
  const { isConnected, deviceAttrs } = useDeviceStatusModel();

  const resourceInfos = useFetcher(
    ipcAgent.async.projects_getAllProjectResourceInfos,
    [],
  );
  const projectInfo = resourceInfos.find(
    (info) =>
      info.origin === deviceAttrs?.origin &&
      info.projectId === deviceAttrs?.projectId,
  );

  return {
    currentDeviceKeyboardName: projectInfo?.keyboardName || '',
    isDeviceConnected: isConnected,
  };
}
