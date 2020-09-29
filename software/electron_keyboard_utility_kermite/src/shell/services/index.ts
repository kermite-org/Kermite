import { applicationStorage } from './ApplicationStorage';
import { applicationSettingsProvider } from './ApplicationSettingsProvider';
import { keyboardShapesProvider } from './KeyboardShapesProvider';
import { keyboardConfigProvider } from './KeyboardConfigProvider';
import { profileManager } from './ProfileManager';
import { deviceService } from './KeyboardDevice';
import { firmwareUpdationService } from './FirmwareUpdation';
import { ipcBridge } from '~shell/IpcBridge';
import { inputLogicSimulator } from './KeyboardLogic';

export const services = new (class {
  async initialize() {
    console.log(`initialize services`);
    await applicationStorage.initialize();
    await applicationSettingsProvider.initialize();
    await keyboardConfigProvider.initialize();
    await keyboardShapesProvider.initialize();
    await profileManager.initialize();
    await deviceService.initialize();
    await firmwareUpdationService.initialize();
    await inputLogicSimulator.initialize();
    await ipcBridge.initialize();
  }

  async terminate() {
    console.log(`terminate services`);
    await ipcBridge.terminate();
    await inputLogicSimulator.terminate();
    await firmwareUpdationService.terminate();
    await deviceService.terminate();
    await profileManager.terminate();
    await keyboardShapesProvider.terminate();
    await keyboardConfigProvider.terminate();
    await applicationSettingsProvider.terminate();
    await applicationStorage.terminate();
  }
})();
