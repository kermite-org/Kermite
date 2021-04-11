import { Hook } from 'qx';
import { IKeyboardDeviceAttributes } from '~/shared';
import { ipcAgent } from '~/ui/common/base';

export interface IDeviceStatusModel {
  isConnected: boolean;
  deviceAttrs: IKeyboardDeviceAttributes | undefined;
}

export function useDeviceStatusModel(): IDeviceStatusModel {
  const [deviceStatus] = Hook.useState<IDeviceStatusModel>({
    isConnected: false,
    deviceAttrs: undefined,
  });

  Hook.useEffect(
    () =>
      ipcAgent.events.device_keyboardDeviceStatusEvents.subscribe((status) => {
        if (status.isConnected !== undefined) {
          deviceStatus.isConnected = status.isConnected;
        }
        if ('deviceAttrs' in status) {
          deviceStatus.deviceAttrs = status.deviceAttrs;
        }
      }),
    [],
  );
  return deviceStatus;
}
