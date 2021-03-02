import {
  IKeyboardLayoutStandard,
  IProfileData,
  IRealtimeKeyboardEvent,
} from '~/shared';
import { DeviceSelectionManager } from '~/shell/services/device/KeyboardDevice/DeviceSelectionManager';
import { KeyboardDeviceServiceCore } from '~/shell/services/device/KeyboardDevice/DeviceServiceCore';
import { KeyMappingEmitter } from '~/shell/services/device/KeyboardDevice/KeyMappingEmitter';
import { IKeyboardDeviceServcie } from '~/shell/services/device/KeyboardDevice/interfaces';

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
    const device = this.selectionManager.selectTargetDevice(path);
    this.core.setDeivce(device);
    if (device) {
      device.onClosed(() => this.core.setDeivce(undefined));
    }
  }

  initialize() {
    this.selectionManager.initialize();
  }

  terminate() {
    this.selectionManager.terminate();
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
