import { IProfileData, IRealtimeKeyboardEvent } from '~/shared';
import {
  DeviceSelectionManager,
  IDeviceSelectionManagerEvent,
} from '~/shell/services/keyboardDevice/deviceSelectionManager';
import { KeyboardDeviceServiceCore } from '~/shell/services/keyboardDevice/deviceServiceCoreImpl';
import { IKeyboardDeviceService } from '~/shell/services/keyboardDevice/interfaces';
import { KeyMappingEmitter } from '~/shell/services/keyboardDevice/keyMappingEmitter';

export class KeyboardDeviceService implements IKeyboardDeviceService {
  private core = new KeyboardDeviceServiceCore();
  private selectionManager = new DeviceSelectionManager();

  get realtimeEventPort() {
    return this.core.realtimeEventPort;
  }

  async selectTargetDevice(path: string) {
    await this.selectionManager.selectTargetDevice(path);
  }

  async selectHidDevice() {
    await this.selectionManager.selectHidDevice();
    // this.core.setDevice(this.selectionManager.getDevice());
  }

  private handleDeviceSelectionManagerEvent = (
    ev: IDeviceSelectionManagerEvent,
  ) => {
    if (ev.deviceChanged) {
      this.core.setDevice(this.selectionManager.getDevice());
    }
  };

  async initialize() {
    this.selectionManager.eventPort.subscribe(
      this.handleDeviceSelectionManagerEvent,
    );
    await this.selectionManager.initialize();
  }

  async disposeConnectedHidDevice() {
    await this.selectionManager.disposeConnectedHidDevice();
  }

  terminate() {
    this.selectionManager.eventPort.unsubscribe(
      this.handleDeviceSelectionManagerEvent,
    );
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
