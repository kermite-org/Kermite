import { IKeyboardDeviceInfo } from '~/shared';
import { ipcAgent, ISelectorOption } from '~/ui/base';
import { uiState } from '~/ui/store';

interface IDeviceSelectionPartModel {
  deviceOptions: ISelectorOption[];
  currentDevicePath: string;
  setSelectedDevicePath(path: string): void;
}

function makeDeviceOptionEntry(
  deviceInfo: IKeyboardDeviceInfo,
): ISelectorOption {
  const { path, productName } = deviceInfo;
  return {
    label: productName,
    value: path,
  };
}

export function useDeviceSelectionPartModel(): IDeviceSelectionPartModel {
  const selectionStatus = uiState.core.deviceSelectionStatus;
  const noneOption: ISelectorOption = { label: 'none', value: 'none' };
  const deviceOptionsBase: ISelectorOption[] =
    selectionStatus.allDeviceInfos.map((deviceInfo) =>
      makeDeviceOptionEntry(deviceInfo),
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
