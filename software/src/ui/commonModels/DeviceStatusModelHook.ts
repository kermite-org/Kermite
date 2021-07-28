import { useEffect, useLocal } from 'qx';
import { IKeyboardDeviceAttributes } from '~/shared';
import { ipcAgent } from '~/ui/base';

export interface IDeviceStatusModel {
  isConnected: boolean;
  deviceAttrs: IKeyboardDeviceAttributes | undefined;
}

export function useDeviceStatusModel(): IDeviceStatusModel {
  const deviceStatus = useLocal<IDeviceStatusModel>({
    isConnected: false,
    deviceAttrs: undefined,
  });

  useEffect(
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
