import { backendAgent } from '../core/ipc';
import { IKeyboardDeviceStatus } from '~defs/IpcContract';
import { appUi } from '../core/appUi';

export class DeviceStatusModel {
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
