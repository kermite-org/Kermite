import { useKeyboardDeviceStatus, useProjectInfo } from '~/ui/commonModels';

export function makeDeviceControlSectionViewModel() {
  const { isConnected, deviceAttrs } = useKeyboardDeviceStatus();
  const projectInfo = useProjectInfo(
    deviceAttrs?.origin,
    deviceAttrs?.projectId,
  );
  return {
    currentDeviceKeyboardName: projectInfo?.keyboardName || '',
    isDeviceConnected: isConnected,
  };
}
