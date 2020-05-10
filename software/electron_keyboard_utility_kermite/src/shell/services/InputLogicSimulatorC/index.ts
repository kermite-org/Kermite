import { IProfileManagerStatus, IRealtimeKeyboardEvent } from '~defs/ipc';
import { appGlobal } from '../appGlobal';
import { IInputLogicSimulator } from '../InputLogicSimulator.interface';
import { IntervalTimerWrapper } from '../InputLogicSimulator/IntervalTimerWrapper';
import {
  logicSimulatorStateC,
  createModuleFlow
} from './LogicSimulatorCCommon';
import { ModuleA_KeyIdReader } from './ModuleA_KeyIdReader';
import { ModuleC_InputTriggerDetector } from './ModuleC_InputTriggerDetector';
import { ModuleD_KeyInputAssignReader } from './ModuleD_KeyInputAssignReader';
import { ModuleF_KeyEventPrioritySorter } from './ModuleF_KeyEventPrioritySorter';
import { ModuleK_KeyStrokeAssignDispatcher } from './ModuleK_KeyStrokeAssignDispatcher';
import { ModuleN_VirtualKeyEventAligner } from './ModuleN_VirtualKeyEventAligner';
import { ModuleR_VirtualKeyBinder } from './ModuleR_VirtualKeyBinder';
import { ModuleT_OutputKeyStateCombiner } from './ModuleT_OutputKeyStateCombiner';
import { ModuleW_HidReportOutputBuffer } from './ModuleW_HidReportOutputBuffer';

export namespace InputLogicSimulatorC {
  const tickerTimer = new IntervalTimerWrapper();

  function onProfileStatusChanged(
    changedStatus: Partial<IProfileManagerStatus>
  ) {
    if (changedStatus.loadedProfileData) {
      logicSimulatorStateC.profileData = changedStatus.loadedProfileData;
    }
  }

  function onRealtimeKeyboardEvent(event: IRealtimeKeyboardEvent) {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      ModuleA_KeyIdReader.io.push({ keyIndex, isDown });
    }
  }

  function setupWiring() {
    createModuleFlow(ModuleA_KeyIdReader.io)
      .chain(ModuleC_InputTriggerDetector.io)
      .chain(ModuleD_KeyInputAssignReader.io)
      .chain(ModuleF_KeyEventPrioritySorter.io)
      .chain(ModuleK_KeyStrokeAssignDispatcher.io)
      .chain(ModuleN_VirtualKeyEventAligner.io)
      .chain(ModuleR_VirtualKeyBinder.io)
      .chain(ModuleT_OutputKeyStateCombiner.io)
      .chain(ModuleW_HidReportOutputBuffer.io);
    ModuleW_HidReportOutputBuffer.io.chainTo((report) =>
      appGlobal.deviceService.writeSideBrainHidReport(report)
    );
  }

  function processTicker() {
    ModuleC_InputTriggerDetector.handleTicker();
    ModuleF_KeyEventPrioritySorter.processTicker();
    ModuleN_VirtualKeyEventAligner.processUpdate();
    ModuleW_HidReportOutputBuffer.processTicker();
  }

  async function initialize() {
    setupWiring();
    appGlobal.profileManager.subscribeStatus(onProfileStatusChanged);
    appGlobal.deviceService.setSideBrainMode(true);
    appGlobal.deviceService.subscribe(onRealtimeKeyboardEvent);
    tickerTimer.start(processTicker, 5);
  }

  async function terminate() {
    appGlobal.deviceService.writeSideBrainHidReport([0, 0, 0, 0, 0, 0, 0, 0]);
    appGlobal.deviceService.unsubscribe(onRealtimeKeyboardEvent);
    appGlobal.deviceService.setSideBrainMode(false);
    tickerTimer.stop();
  }

  export function getInterface(): IInputLogicSimulator {
    return {
      initialize,
      terminate
    };
  }
}
