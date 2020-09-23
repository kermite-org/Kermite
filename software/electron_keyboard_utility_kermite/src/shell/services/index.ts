import { ApplicationStorage } from './ApplicationStorage';
import { KeyboardDeviceService } from './KeyboardDevice';
// import { IInputLogicSimulator } from './InputLogicSimulator.interface';
// import { InputLogicSimulatorC } from './InputLogicSimulatorC';
import { IpcBridge } from '../IpcBridge';
import { ProfileManager } from './ProfileManager';
import { InputLogicSimulatorD } from './InputLogicSimulatorD';
import { TypedEventEmitter } from '~funcs/TypedEventEmitter';
import { IAppWindowEvent } from '~defs/IpcContract';
import { KeyboardConfigProvider } from './KeyboardConfigProvider';
import { ApplicationSettingsProvider } from './ApplicationSettingsProvider';
import { FirmwareUpdationService } from './FirmwareUpdation';
import { KeyboardShapesProvider } from './KeyboardShapesProvider';

interface TypedApplicationEvent {
  mainWindowClosed: true;
  reloadApplicationRequested: true;
  appWindowEvent: IAppWindowEvent;
}

export const services = new (class {
  applicationStorage = new ApplicationStorage();
  shapeProvider = new KeyboardShapesProvider();
  profileManager = new ProfileManager(
    this.applicationStorage,
    this.shapeProvider
  );
  deviceService = new KeyboardDeviceService();
  // inputLogicSimulator = InputLogicSimulatorC.getInterface();
  inputLogicSimulator = InputLogicSimulatorD.getInterface();
  ipcBridge = new IpcBridge();
  eventBus = new TypedEventEmitter<TypedApplicationEvent>();
  keyboardConfigProvider = new KeyboardConfigProvider(this.applicationStorage);
  settingsProvider = new ApplicationSettingsProvider(this.applicationStorage);
  firmwareUpdationService = new FirmwareUpdationService();

  async initialize() {
    console.log(`initialize services`);
    await this.applicationStorage.initialize();
    await this.settingsProvider.initialize();
    await this.keyboardConfigProvider.initialize();
    await this.profileManager.initialize();
    await this.deviceService.initialize();
    await this.firmwareUpdationService.initialize();
    await this.inputLogicSimulator.initialize();
    await this.ipcBridge.initialize();
    await this.shapeProvider.initialize();
  }

  async terminate() {
    console.log(`terminate services`);
    await this.shapeProvider.terminate();
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
