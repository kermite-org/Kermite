import {
  projectPackagesReader,
  useKeyboardDeviceStatus,
} from '~/ui/commonModels';

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
