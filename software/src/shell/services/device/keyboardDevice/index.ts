import { IProfileData, IRealtimeKeyboardEvent } from '~/shared';
import { DeviceSelectionManager } from '~/shell/services/device/keyboardDevice/DeviceSelectionManager';
import { KeyboardDeviceServiceCore } from '~/shell/services/device/keyboardDevice/DeviceServiceCoreImpl';
import { IKeyboardDeviceServcie } from '~/shell/services/device/keyboardDevice/Interfaces';
import { KeyMappingEmitter } from '~/shell/services/device/keyboardDevice/KeyMappingEmitter';

export class KeyboardDeviceService implements IKeyboardDeviceServcie {
  private core = new KeyboardDeviceServiceCore();
  private selectionManager = new DeviceSelectionManager();

  get realtimeEventPort() {
    return this.core.realtimeEventPort;
  }

  get statusEventPort() {
    return this.core.statusEventPort;
  }

  get selectionStatusEventPort() {
    return this.selectionManager.selectionStatusEventPort;
  }

  selectTargetDevice(path: string) {
    this.selectionManager.selectTargetDevice(path);
    this.core.setDeivce(this.selectionManager.getDevice());
  }

  initialize() {
    this.selectionManager.initialize();
    this.core.setDeivce(this.selectionManager.getDevice());
  }

  terminate() {
    this.selectionManager.terminate();
  }

  setCustomParameterValue(index: number, value: number) {
    this.core.setCustomParameterValue(index, value);
  }

  setSimulatorMode(enabled: boolean) {
    this.core.setSimulatorMode(enabled);
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
