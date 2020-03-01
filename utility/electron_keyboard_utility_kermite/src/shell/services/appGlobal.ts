import { DeviceService } from './DeviceService';
import { ApplicationStorage } from './ApplicationStorage';
import { ProfileManager } from './ProfileManager';
import { InputLogicSimulator } from './InputLogicSimulator';
import { IpcBridge } from './IpcBridge';
import { EventBus } from '~funcs/EventBus';
import { InputLogicSimulatorA } from './InputLogicSimulatorA';

interface TypedApplicationEvent {
  mainWindowClosed: true;
  reloadApplicationRequested: true;
}

export const appGlobal = new (class {
  applicationStorage = new ApplicationStorage();
  profileManager = new ProfileManager();
  deviceService = new DeviceService();
  // inputLogicSimulator = new InputLogicSimulator();
  inputLogicSimulator = new InputLogicSimulatorA();
  ipcBridge = new IpcBridge();
  eventBus = new EventBus<TypedApplicationEvent>();

  async initialize() {
    console.log(`initialize services`);
    await appGlobal.applicationStorage.initialize();
    await appGlobal.profileManager.initialize();
    await appGlobal.deviceService.initialize();
    await appGlobal.inputLogicSimulator.initialize();
    await appGlobal.ipcBridge.initialize();
  }

  async terminate() {
    console.log(`terminate services`);
    await appGlobal.ipcBridge.terminate();
    await appGlobal.inputLogicSimulator.terminate();
    await appGlobal.deviceService.terminate();
    await appGlobal.profileManager.terminate();
    await appGlobal.applicationStorage.terminate();
  }
})();
