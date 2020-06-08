import { backendAgent } from './dataSource/ipc';
import { IKeyboardDeviceStatus } from '~defs/ipc';

export class DeviceStatusModel {
  private _isConnected: boolean = false;

  get isConnected() {
    return this._isConnected;
  }

  private onDeviceStatusChanged = (status: Partial<IKeyboardDeviceStatus>) => {
    if (status.isConnected !== undefined) {
      this._isConnected = status.isConnected;
    }
  };

  initialize() {
    backendAgent.keyboardDeviceStatusEvents.subscribe(
      this.onDeviceStatusChanged
    );
  }

  finalinze() {
    backendAgent.keyboardDeviceStatusEvents.unsubscribe(
      this.onDeviceStatusChanged
    );
  }
}
