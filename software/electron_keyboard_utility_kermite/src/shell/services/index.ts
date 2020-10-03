import { ipcBridge } from '~shell/services/IpcBridge';
import { applicationSettingsProvider } from './ApplicationSettingsProvider';
import { applicationStorage } from './ApplicationStorage';
import { firmwareUpdationService } from './FirmwareUpdation';
import { keyboardConfigProvider } from './KeyboardConfigProvider';
import { deviceService } from './KeyboardDevice';
import { inputLogicSimulator } from './KeyboardLogic';
import { keyboardShapesProvider } from './KeyboardShapesProvider';
import { profileManager } from './ProfileManager';

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
