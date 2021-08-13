import { IKeyboardDeviceInfo, IProjectPackageInfo } from '~/shared';
import { ipcAgent, ISelectorOption } from '~/ui/base';
import { uiGlobalStore, useDeviceSelectionStatus } from '~/ui/commonModels';

interface IDeviceSelectionPartModel {
  deviceOptions: ISelectorOption[];
  currentDevicePath: string;
  setSelectedDevicePath(path: string): void;
}

function makeDeviceOptionEntry(
  deviceInfo: IKeyboardDeviceInfo,
  resourceInfos: IProjectPackageInfo[],
): ISelectorOption {
  const { path, portName, projectId } = deviceInfo;
  const project = resourceInfos.find((info) => info.projectId === projectId);
  const keyboardName = project?.keyboardName;
  const postfix = (keyboardName && ` (${keyboardName})`) || '';
  return {
    label: `device@${portName}${postfix}`,
    value: path,
  };
}

export function useDeviceSelectionPartModel(): IDeviceSelectionPartModel {
  const resourceInfos = uiGlobalStore.allProjectPackageInfos;
  const selectionStatus = useDeviceSelectionStatus();
  const noneOption: ISelectorOption = { label: 'none', value: 'none' };
  const deviceOptionsBase: ISelectorOption[] = selectionStatus.allDeviceInfos.map(
    (deviceInfo) => makeDeviceOptionEntry(deviceInfo, resourceInfos),
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
