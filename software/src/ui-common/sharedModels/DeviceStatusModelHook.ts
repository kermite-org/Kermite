import { Hook } from 'qx';
import { ipcAgent } from '~/ui-common';

export interface IDeviceStatusModel {
  isConnected: boolean;
  deviceAttrs:
    | {
        projectId: string;
        keyboardName: string;
      }
    | undefined;
}

export function useDeviceStatusModel(): IDeviceStatusModel {
  const [deviceStatus] = Hook.useState<IDeviceStatusModel>({
    isConnected: false,
    deviceAttrs: undefined,
  });

  Hook.useEffect(
    () =>
      ipcAgent.subscribe('device_keyboardDeviceStatusEvents', (status) => {
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
