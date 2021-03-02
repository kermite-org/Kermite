import {
  IKeyboardDeviceStatus,
  IKeyboardLayoutStandard,
  IProfileData,
  IRealtimeKeyboardEvent,
} from '~/shared';
import { IEventPort } from '~/shell/funcs';

export interface IKeyboardDeviceServcie {
  realtimeEventPort: IEventPort<IRealtimeKeyboardEvent>;
  statusEventPort: IEventPort<IKeyboardDeviceStatus>;
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
