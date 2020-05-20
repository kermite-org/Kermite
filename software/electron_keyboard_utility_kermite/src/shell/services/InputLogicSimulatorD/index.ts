import { IProfileManagerStatus, IRealtimeKeyboardEvent } from '~defs/ipc';
import { appGlobal } from '../appGlobal';
import { IInputLogicSimulator } from '../InputLogicSimulator.interface';
import { IntervalTimerWrapper } from '../InputLogicSimulator/IntervalTimerWrapper';

import * as CL from './DeviceCoreLogicSimulator';
import { Arrays } from '~funcs/Arrays';
import { converProfileDataToBlobBytes } from './ProfileDataBinaryPacker';

function compareArray(ar0: any[], ar1: any[]): boolean {
  return (
    ar0.length === ar1.length &&
    Arrays.iota(ar0.length).every((i) => ar0[i] === ar1[i])
  );
}

export namespace InputLogicSimulatorD {
  const tickerTimer = new IntervalTimerWrapper();

  function onProfileStatusChanged(
    changedStatus: Partial<IProfileManagerStatus>
  ) {
    if (changedStatus.loadedProfileData) {
      const bytes = converProfileDataToBlobBytes(
        changedStatus.loadedProfileData
      );
      CL.coreLogic_writeProfileDataBlob(bytes);
    }
  }

  function onRealtimeKeyboardEvent(event: IRealtimeKeyboardEvent) {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      CL.coreLogic_handleKeyInput(keyIndex, isDown);
    }
  }

  let prevHidReport: number[] = new Array(8).fill(0);
  function processTicker() {
    CL.coreLogic_processTicker();
    const report = CL.coreLogic_getOutputHidReport();
    if (!compareArray(prevHidReport, report)) {
      appGlobal.deviceService.writeSideBrainHidReport(report);
      prevHidReport = report.slice(0);
    }
  }

  async function initialize() {
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
