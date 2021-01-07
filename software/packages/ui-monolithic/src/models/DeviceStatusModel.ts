import { IKeyboardDeviceStatus } from '~shared/defs/IpcContract';
import { backendAgent } from '~ui/core';

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
    backendAgent.keyboardDeviceStatusEvents.subscribe(
      this.onDeviceStatusChanged,
    );
  }

  finalize() {
    backendAgent.keyboardDeviceStatusEvents.unsubscribe(
      this.onDeviceStatusChanged,
    );
  }
}
