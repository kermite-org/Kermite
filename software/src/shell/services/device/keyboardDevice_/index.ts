import {
  IKeyboardLayoutStandard,
  IProfileData,
  IRealtimeKeyboardEvent,
} from '~/shared';
import { DeviceSelectionManager } from '~/shell/services/device/keyboardDevice_/DeviceSelectionManager';
import { KeyboardDeviceServiceCore } from '~/shell/services/device/keyboardDevice_/DeviceServiceCoreImpl';
import { IKeyboardDeviceServcie } from '~/shell/services/device/keyboardDevice_/Interfaces_';
import { KeyMappingEmitter } from '~/shell/services/device/keyboardDevice_/KeyMappingEmitter';

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

  setSideBrainMode(enabled: boolean) {
    this.core.setSideBrainMode(enabled);
  }

  writeSideBrainHidReport(report: number[]) {
    this.core.writeSideBrainHidReport(report);
  }

  emitRealtimeEventFromSimulator(event: IRealtimeKeyboardEvent) {
    this.realtimeEventPort.emit(event);
  }

  async emitKeyAssignsToDevice(
    editModel: IProfileData,
    layout: IKeyboardLayoutStandard,
  ): Promise<boolean> {
    return await KeyMappingEmitter.emitKeyAssignsToDevice(
      editModel,
      layout,
      this.selectionManager.getDevice(),
    );
  }
}
