import { IProfileManagerStatus, IRealtimeKeyboardEvent } from '~defs/ipc';
import { appGlobal } from '../appGlobal';
import { IInputLogicSimulator } from '../InputLogicSimulator.interface';
import { IntervalTimerWrapper } from '../InputLogicSimulator/IntervalTimerWrapper';

import * as CL from './DeviceCoreLogicSimulator0_Single';
import { converProfileDataToBlobBytes } from './ProfileDataBinaryPacker';
import { generateNumberSequence } from '~funcs/Utils';
import { IKeyboardConfig } from '~defs/ConfigTypes';

function compareArray(ar0: any[], ar1: any[]): boolean {
  return (
    ar0.length === ar1.length &&
    generateNumberSequence(ar0.length).every((i) => ar0[i] === ar1[i])
  );
}

export namespace InputLogicSimulatorD {
  const tickerTimer = new IntervalTimerWrapper();

  const local = new (class {
    isSideBranMode: boolean = false;
  })();

  function updateProfileDataBlob() {
    const prof = appGlobal.profileManager.getCurrentProfile();
    const layoutStandard =
      appGlobal.keyboardConfigProvider.keyboardConfig.layoutStandard;
    if (prof && layoutStandard) {
      const bytes = converProfileDataToBlobBytes(prof, layoutStandard);
      CL.coreLogic_writeProfileDataBlob(bytes);
    }
  }

  function onProfileStatusChanged(
    changedStatus: Partial<IProfileManagerStatus>
  ) {
    if (changedStatus.loadedProfileData) {
      console.log(`logicSimulator, profile data received`);
      updateProfileDataBlob();
    }
  }

  function onKeyboardConfigChanged(changedConfig: Partial<IKeyboardConfig>) {
    if (changedConfig.behaviorMode) {
      const isSideBrainMode = changedConfig.behaviorMode === 'SideBrain';
      if (local.isSideBranMode !== isSideBrainMode) {
        console.log({ isSideBrainMode });
        appGlobal.deviceService.setSideBrainMode(isSideBrainMode);
        local.isSideBranMode = isSideBrainMode;
      }
    }
    if (changedConfig.layoutStandard) {
      console.log({ layout: changedConfig.layoutStandard });
      updateProfileDataBlob();
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
    appGlobal.keyboardConfigProvider.subscribeStatus(onKeyboardConfigChanged);
    appGlobal.deviceService.subscribe(onRealtimeKeyboardEvent);
    tickerTimer.start(processTicker, 5);
  }

  async function terminate() {
    appGlobal.deviceService.unsubscribe(onRealtimeKeyboardEvent);
    if (local.isSideBranMode) {
      appGlobal.deviceService.setSideBrainMode(false);
      local.isSideBranMode = false;
    }
    tickerTimer.stop();
  }

  export function getInterface(): IInputLogicSimulator {
    return {
      initialize,
      terminate
    };
  }
}
