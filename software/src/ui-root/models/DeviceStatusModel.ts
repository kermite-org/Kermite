import { IKeyboardDeviceStatus } from '~/shared';
import { ipcAgent } from '~/ui-common';

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
