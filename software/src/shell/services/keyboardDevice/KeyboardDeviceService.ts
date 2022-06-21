import { IProfileData, IRealtimeKeyboardEvent } from '~/shared';
import { DeviceSelectionManager } from '~/shell/services/keyboardDevice/DeviceSelectionManager';
import { KeyboardDeviceServiceCore } from '~/shell/services/keyboardDevice/DeviceServiceCoreImpl';
import { IKeyboardDeviceService } from '~/shell/services/keyboardDevice/Interfaces';
import { KeyMappingEmitter } from '~/shell/services/keyboardDevice/KeyMappingEmitter';

export class KeyboardDeviceService implements IKeyboardDeviceService {
  private core = new KeyboardDeviceServiceCore();
  private selectionManager = new DeviceSelectionManager();

  get realtimeEventPort() {
    return this.core.realtimeEventPort;
  }

  selectTargetDevice(_path: string) {
    // this.selectionManager.selectTargetDevice(path);
    // this.core.setDevice(this.selectionManager.getDevice());
    throw new Error('obsolete function invoked');
  }

  async selectHidDevice() {
    await this.selectionManager.selectHidDevice();
    this.core.setDevice(this.selectionManager.getDevice());
  }

  async initialize() {
    await this.selectionManager.initialize();
    this.core.setDevice(this.selectionManager.getDevice());
  }

  disposeConnectedHidDevice() {
    this.selectionManager.disposeConnectedHidDevice();
  }

  terminate() {
    this.selectionManager.terminate();
  }

  setCustomParameterValue(index: number, value: number) {
    this.core.setCustomParameterValue(index, value);
  }

  resetParameters() {
    this.core.resetParameters();
  }

  setSimulatorMode(enabled: boolean) {
    this.core.setSimulatorMode(enabled);
  }

  setMuteMode(enabled: boolean) {
    this.core.setMuteMode(enabled);
  }

  writeSimulatorHidReport(report: number[]) {
    this.core.writeSimulatorHidReport(report);
  }

  emitRealtimeEventFromSimulator(event: IRealtimeKeyboardEvent) {
    this.realtimeEventPort.emit(event);
  }

  async emitKeyAssignsToDevice(editModel: IProfileData): Promise<boolean> {
    return await KeyMappingEmitter.emitKeyAssignsToDevice(
      editModel,
      this.selectionManager.getDevice(),
    );
  }
}
