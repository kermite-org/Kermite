import { backendAgent, sendIpcPacketSync } from './dataSource/ipc';
import { appUi } from './appGlobal';

export class ApplicationSettingsModel {
  showTestInputArea: boolean = false;

  private async loadSettings() {
    const settings = await backendAgent.getSettings();
    this.showTestInputArea = settings.showTestInputArea;
    appUi.rerender();
  }

  initialize() {
    this.loadSettings();
  }

  finalize() {
    const { showTestInputArea } = this;
    sendIpcPacketSync({ saveSettingsOnClosing: { showTestInputArea } });
  }
}
