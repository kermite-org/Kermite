import { IKeyboardDeviceStatus } from '~defs/IpcContract';
import { backendAgent, appUi } from '~ui/core';

class DeviceStatusModel {
  isConnected: boolean = false;

  deviceAttrs:
    | {
        projectId: string;
        projectName: string;
      }
    | undefined;

  private onDeviceStatusChanged = (status: Partial<IKeyboardDeviceStatus>) => {
    if (status.isConnected !== undefined) {
      this.isConnected = status.isConnected;
      appUi.rerender();
    }
    if ('deviceAttrs' in status) {
      this.deviceAttrs = status.deviceAttrs;
      appUi.rerender();
    }
  };

  initialize() {
    backendAgent.keyboardDeviceStatusEvents.subscribe(
      this.onDeviceStatusChanged
    );
  }

  finalize() {
    backendAgent.keyboardDeviceStatusEvents.unsubscribe(
      this.onDeviceStatusChanged
    );
  }
}

export const deviceStatusModel = new DeviceStatusModel();
