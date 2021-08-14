import { IKeyboardDeviceInfo } from '~/shared';
import { ipcAgent, ISelectorOption } from '~/ui/base';
import { projectPackagesReader, uiState } from '~/ui/commonStore';

interface IDeviceSelectionPartModel {
  deviceOptions: ISelectorOption[];
  currentDevicePath: string;
  setSelectedDevicePath(path: string): void;
}

function makeDeviceOptionEntry(
  deviceInfo: IKeyboardDeviceInfo,
): ISelectorOption {
  const { path, portName, firmwareId } = deviceInfo;
  const firmwareInfo = projectPackagesReader.findFirmwareInfo(firmwareId);
  const keyboardDisplayName = firmwareInfo?.firmwareProjectPath;
  const postfix = (keyboardDisplayName && ` (${keyboardDisplayName})`) || '';
  return {
    label: `device@${portName}${postfix}`,
    value: path,
  };
}

export function useDeviceSelectionPartModel(): IDeviceSelectionPartModel {
  const selectionStatus = uiState.core.deviceSelectionStatus;
  const noneOption: ISelectorOption = { label: 'none', value: 'none' };
  const deviceOptionsBase: ISelectorOption[] = selectionStatus.allDeviceInfos.map(
    (deviceInfo) => makeDeviceOptionEntry(deviceInfo),
  );
  const deviceOptions = [noneOption, ...deviceOptionsBase];

  const setSelectedDevicePath = (path: string) => {
    ipcAgent.async.device_connectToDevice(path);
  };

  return {
    deviceOptions,
    currentDevicePath: selectionStatus.currentDevicePath,
    setSelectedDevicePath,
  };
}
