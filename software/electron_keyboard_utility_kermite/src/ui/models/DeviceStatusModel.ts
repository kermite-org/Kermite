import { backendAgent, appUi } from '~ui/core';
import { IKeyboardDeviceStatus } from '~defs/IpcContract';

class DeviceStatusModel {
  private _isConnected: boolean = false;

  get isConnected() {
    return this._isConnected;
  }

  private onDeviceStatusChanged = (status: Partial<IKeyboardDeviceStatus>) => {
    if (status.isConnected !== undefined) {
      this._isConnected = status.isConnected;
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
