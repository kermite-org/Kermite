import { IKeyboardDeviceStatus } from '@kermite/shared';
import { ipcAgent } from '@kermite/ui';

export class DeviceStatusModel {
  isConnected: boolean = false;

  deviceAttrs:
    | {
        projectId: string;
        keyboardName: string;
      }
    | undefined;

  private onDeviceStatusChanged = (status: Partial<IKeyboardDeviceStatus>) => {
    if (status.isConnected !== undefined) {
      this.isConnected = status.isConnected;
    }
    if ('deviceAttrs' in status) {
      this.deviceAttrs = status.deviceAttrs;
    }
  };

  initialize() {
    ipcAgent.subscribe2(
      'device_keyboardDeviceStatusEvents',
      this.onDeviceStatusChanged,
    );
  }

  finalize() {
    ipcAgent.unsubscribe2(
      'device_keyboardDeviceStatusEvents',
      this.onDeviceStatusChanged,
    );
  }
}
