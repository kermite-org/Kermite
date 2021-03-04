import {
  IDeviceSelectionStatus,
  IKeyboardDeviceStatus,
  IKeyboardLayoutStandard,
  IProfileData,
  IRealtimeKeyboardEvent,
} from '~/shared';
import { IEventPort } from '~/shell/funcs';

export interface IKeyboardDeviceServcie {
  selectionStatusEventPort: IEventPort<Partial<IDeviceSelectionStatus>>;
  realtimeEventPort: IEventPort<IRealtimeKeyboardEvent>;
  statusEventPort: IEventPort<IKeyboardDeviceStatus>;
  selectTargetDevice(path: string): void;
  setSideBrainMode(enabled: boolean): void;
  writeSideBrainHidReport(report: number[]): void;
  emitRealtimeEventFromSimulator(event: IRealtimeKeyboardEvent): void;
  emitKeyAssignsToDevice(
    editModel: IProfileData,
    layout: IKeyboardLayoutStandard,
  ): Promise<boolean>;
  initialize(): void;
  terminate(): void;
}
