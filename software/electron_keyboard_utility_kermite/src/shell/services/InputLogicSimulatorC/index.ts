import { IProfileManagerStatus, IRealtimeKeyboardEvent } from '~defs/ipc';
import { appGlobal } from '../appGlobal';
import { IInputLogicSimulator } from '../InputLogicSimulator.interface';
import { IntervalTimerWrapper } from '../InputLogicSimulator/IntervalTimerWrapper';
import { logicSimulatorStateC } from './LogicSimulatorCCommon';
import { ModuleA_KeyIdReader } from './ModuleA_KeyIdReader';
import { ModuleC_InputTriggerDetector } from './ModuleC_InputTriggerDetector';
import { ModuleF_KeyEventPrioritySorter } from './ModuleF_KeyEventPrioritySorter';
import { ModuleN_VirtualKeyEventAligner } from './ModuleN_VirtualKeyEventAligner';
import { ModuleW_HidReportOutputBuffer } from './ModuleW_HidReportOutputBuffer';

export class InputLogicSimulatorC implements IInputLogicSimulator {
  private tickerTimer = new IntervalTimerWrapper();

  private onProfileStatusChanged = (
    changedStatus: Partial<IProfileManagerStatus>
  ) => {
    if (changedStatus.loadedProfileData) {
      logicSimulatorStateC.profileData = changedStatus.loadedProfileData;
    }
  };

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      const ev0 = { keyIndex, isDown };
      ModuleA_KeyIdReader.processEvent(ev0);
    }
  };

  private processTicker = () => {
    ModuleC_InputTriggerDetector.handleTicker();
    ModuleF_KeyEventPrioritySorter.processTicker();
    ModuleN_VirtualKeyEventAligner.processUpdate();
    ModuleW_HidReportOutputBuffer.processTicker();
  };

  async initialize() {
    appGlobal.profileManager.subscribeStatus(this.onProfileStatusChanged);
    appGlobal.deviceService.setSideBrainMode(true);
    appGlobal.deviceService.subscribe(this.onRealtimeKeyboardEvent);
    this.tickerTimer.start(this.processTicker, 5);
  }

  async terminate() {
    appGlobal.deviceService.unsubscribe(this.onRealtimeKeyboardEvent);
    appGlobal.deviceService.setSideBrainMode(false);
    this.tickerTimer.stop();
  }
}
