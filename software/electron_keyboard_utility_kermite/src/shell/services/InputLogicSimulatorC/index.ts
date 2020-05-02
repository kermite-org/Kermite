import { HidKeyCodes } from '~defs/HidKeyCodes';
import { IProfileManagerStatus, IRealtimeKeyboardEvent } from '~defs/ipc';
import {
  fallbackProfileData,
  IEditModel,
  IKeyAssignEntry,
  IAssignOperation
} from '~defs/ProfileData';
import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { appGlobal } from '../appGlobal';
import { IInputLogicSimulator } from '../InputLogicSimulator.interface';
import { IntervalTimerWrapper } from '../InputLogicSimulator/IntervalTimerWrapper';
import { KeyIndexKeyEvent, TKeyTrigger } from '../InputLogicSimulatorB/common';
import { Arrays } from '~funcs/Arrays';
import { ModuleW_HidReportOutputBuffer } from './ModuleW_HidReportOutputBuffer';
import { logicSimulatorStateC } from './LogicSimulatorStateC';
import { ModuleA_KeyInputAssignBinder } from './ModuleA_KeyInputAssignBinder';

export class InputLogicSimulatorC implements IInputLogicSimulator {
  private tikerTimer = new IntervalTimerWrapper();
  private tikerTimer2 = new IntervalTimerWrapper();

  private onProfileStatusChanged = (
    changedStatus: Partial<IProfileManagerStatus>
  ) => {
    if (changedStatus.loadedEditModel) {
      logicSimulatorStateC.editModel = changedStatus.loadedEditModel;
    }
  };

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      const ev0 = { keyIndex, isDown };
      ModuleA_KeyInputAssignBinder.processEvents(ev0);
    }
  };

  private processTicker = () => {
    ModuleA_KeyInputAssignBinder.processTicker();
  };

  private processFastTicker = () => {
    ModuleW_HidReportOutputBuffer.processTicker();
  };

  async initialize() {
    appGlobal.profileManager.subscribeStatus(this.onProfileStatusChanged);
    appGlobal.deviceService.setSideBrainMode(true);
    appGlobal.deviceService.subscribe(this.onRealtimeKeyboardEvent);
    this.tikerTimer.start(this.processTicker, 10);
    this.tikerTimer2.start(this.processFastTicker, 2);
  }

  async terminate() {
    appGlobal.deviceService.unsubscribe(this.onRealtimeKeyboardEvent);
    appGlobal.deviceService.setSideBrainMode(false);
    this.tikerTimer.stop();
    this.tikerTimer2.stop();
  }
}
