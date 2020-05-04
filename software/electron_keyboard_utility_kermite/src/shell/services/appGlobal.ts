import { EventBus } from '~funcs/EventBus';
import { ApplicationStorage } from './ApplicationStorage';
import { DeviceService } from './DeviceService';
import { IInputLogicSimulator } from './InputLogicSimulator.interface';
import { InputLogicSimulatorC } from './InputLogicSimulatorC';
import { IpcBridge } from './IpcBridge';
import { ProfileManager } from './ProfileManager';

interface TypedApplicationEvent {
  mainWindowClosed: true;
  reloadApplicationRequested: true;
}

export const appGlobal = new (class {
  applicationStorage = new ApplicationStorage();
  profileManager = new ProfileManager();
  deviceService = new DeviceService();
  inputLogicSimulator: IInputLogicSimulator = new InputLogicSimulatorC();
  ipcBridge = new IpcBridge();
  eventBus = new EventBus<TypedApplicationEvent>();

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
