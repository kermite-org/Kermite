import { ipcAgent, useFetcher } from '~/ui-common';
import { useDeviceStatusModel } from '~/ui-common/sharedModels/DeviceStatusModelHook';

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
