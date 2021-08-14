import {
  IDeviceSelectionStatus,
  IProfileData,
  IRealtimeKeyboardEvent,
} from '~/shared';
import { IEventPort } from '~/shell/funcs';

export interface IKeyboardDeviceServcie {
  selectionStatusEventPort: IEventPort<Partial<IDeviceSelectionStatus>>;
  realtimeEventPort: IEventPort<IRealtimeKeyboardEvent>;
  selectTargetDevice(path: string): void;
  setSimulatorMode(enabled: boolean): void;
  writeSimulatorHidReport(report: number[]): void;
  setCustomParameterValue(index: number, value: number): void;
  emitRealtimeEventFromSimulator(event: IRealtimeKeyboardEvent): void;
  emitKeyAssignsToDevice(editModel: IProfileData): Promise<boolean>;
  initialize(): void;
  terminate(): void;
}
