import { useKeyboardDeviceStatus } from '~/ui/commonModels';
import { projectPackagesReader } from '~/ui/commonStore';

export function makeDeviceControlSectionViewModel() {
  const { isConnected, deviceAttrs } = useKeyboardDeviceStatus();
  const projectInfo = projectPackagesReader.findProjectInfo(
    deviceAttrs?.origin,
    deviceAttrs?.projectId,
  );
  return {
    currentDeviceKeyboardName: projectInfo?.keyboardName || '',
    isDeviceConnected: isConnected,
  };
}
