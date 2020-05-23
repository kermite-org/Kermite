import { ApplicationStorage } from './ApplicationStorage';
import { DeviceService } from './DeviceService';
import { IInputLogicSimulator } from './InputLogicSimulator.interface';
import { InputLogicSimulatorC } from './InputLogicSimulatorC';
import { IpcBridge } from './IpcBridge';
import { ProfileManager } from './ProfileManager';
import { InputLogicSimulatorD } from './InputLogicSimulatorD';
import { TypedEventEmitter } from '~funcs/TypedEventEmitter';
import { IAppWindowEvent } from '~defs/ipc';

interface TypedApplicationEvent {
  mainWindowClosed: true;
  reloadApplicationRequested: true;
  appWindowEvent: IAppWindowEvent;
}

export const appGlobal = new (class {
  applicationStorage = new ApplicationStorage();
  profileManager = new ProfileManager();
  deviceService = new DeviceService();
  // inputLogicSimulator = InputLogicSimulatorC.getInterface();
  inputLogicSimulator = InputLogicSimulatorD.getInterface();
  ipcBridge = new IpcBridge();
  eventBus = new TypedEventEmitter<TypedApplicationEvent>();

  async initialize() {
    // eslint-disable-next-line no-console
    console.log(`initialize services`);
    await this.applicationStorage.initialize();
    await this.profileManager.initialize();
    await this.deviceService.initialize();
    await this.inputLogicSimulator.initialize();
    await this.ipcBridge.initialize();
  }

  async terminate() {
    // eslint-disable-next-line no-console
    console.log(`terminate services`);
    await this.ipcBridge.terminate();
    await this.inputLogicSimulator.terminate();
    await this.deviceService.terminate();
    await this.profileManager.terminate();
    await this.applicationStorage.terminate();
  }
})();
