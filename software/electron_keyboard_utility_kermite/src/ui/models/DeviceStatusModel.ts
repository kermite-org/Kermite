import { backendAgent } from './dataSource/ipc';
import { IKeyboardDeviceStatus } from '~defs/ipc';
import { appUi } from './appGlobal';

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

  async initialize() {
    backendAgent.keyboardDeviceStatusEvents.subscribe(
      this.onDeviceStatusChanged
    );
  }

  async finalize() {
    backendAgent.keyboardDeviceStatusEvents.unsubscribe(
      this.onDeviceStatusChanged
    );
  }
}
