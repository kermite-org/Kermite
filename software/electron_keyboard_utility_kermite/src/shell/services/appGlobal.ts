import { ApplicationStorage } from './ApplicationStorage';
import { KeyboardDeviceService } from './KeyboardDevice';
import { IInputLogicSimulator } from './InputLogicSimulator.interface';
import { InputLogicSimulatorC } from './InputLogicSimulatorC';
import { IpcBridge } from './IpcBridge';
import { ProfileManager } from './ProfileManager';
import { InputLogicSimulatorD } from './InputLogicSimulatorD';
import { TypedEventEmitter } from '~funcs/TypedEventEmitter';
import { IAppWindowEvent } from '~defs/ipc';
import { KeyboardConfigProvider } from './KeyboardConfigProvider';
import { ApplicationSettingsProvider } from './ApplicationSettingsProvider';
import { FirmwareUpdationService } from './FirmwareUpdation';

interface TypedApplicationEvent {
  mainWindowClosed: true;
  reloadApplicationRequested: true;
  appWindowEvent: IAppWindowEvent;
}

export const appGlobal = new (class {
  applicationStorage = new ApplicationStorage();
  profileManager = new ProfileManager();
  deviceService = new KeyboardDeviceService();
  // inputLogicSimulator = InputLogicSimulatorC.getInterface();
  inputLogicSimulator = InputLogicSimulatorD.getInterface();
  ipcBridge = new IpcBridge();
  eventBus = new TypedEventEmitter<TypedApplicationEvent>();
  keyboardConfigProvider = new KeyboardConfigProvider();
  settingsProvider = new ApplicationSettingsProvider();
  firmwareUpdationService = new FirmwareUpdationService();

  async initialize() {
    // eslint-disable-next-line no-console
    console.log(`initialize services`);
    await this.applicationStorage.initialize();
    await this.settingsProvider.initialize();
    await this.keyboardConfigProvider.initialize();
    await this.profileManager.initialize();
    await this.deviceService.initialize();
    await this.firmwareUpdationService.initialize();
    await this.inputLogicSimulator.initialize();
    await this.ipcBridge.initialize();
  }

  async terminate() {
    // eslint-disable-next-line no-console
    console.log(`terminate services`);
    await this.ipcBridge.terminate();
    await this.inputLogicSimulator.terminate();
    await this.firmwareUpdationService.terminate();
    await this.deviceService.terminate();
    await this.profileManager.terminate();
    await this.keyboardConfigProvider.terminate();
    await this.settingsProvider.terminate();
    await this.applicationStorage.terminate();
  }
})();
