import { IKeyboardConfig } from '~defs/ConfigTypes';
import {
  IProfileManagerStatus,
  IRealtimeKeyboardEvent
} from '~defs/IpcContract';
import { generateNumberSequence } from '~funcs/Utils';
import { keyboardConfigProvider } from '~shell/services/KeyboardConfigProvider';
import { deviceService } from '~shell/services/KeyboardDevice';
import { profileManager } from '~shell/services/ProfileManager';
import { IInputLogicSimulator } from '../InputLogicSimulator.interface';
import { IntervalTimerWrapper } from '../helpers/IntervalTimerWrapper';
import * as CL from './DeviceCoreLogicSimulator2_Dual';
import { converProfileDataToBlobBytes } from './ProfileDataBinaryPacker';

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
    const prof = profileManager.getCurrentProfile();
    const layoutStandard = keyboardConfigProvider.keyboardConfig.layoutStandard;
    if (prof && layoutStandard) {
      const bytes = converProfileDataToBlobBytes(prof, layoutStandard);
      CL.coreLogic_writeProfileDataBlob(bytes);
      CL.coreLogic_reset();
    }
  }

  function onProfileStatusChanged(
    changedStatus: Partial<IProfileManagerStatus>
  ) {
    if (changedStatus.loadedProfileData) {
      // console.log(`logicSimulator, profile data received`);
      updateProfileDataBlob();
    }
  }

  function onKeyboardConfigChanged(changedConfig: Partial<IKeyboardConfig>) {
    if (changedConfig.behaviorMode) {
      const isSideBrainMode = changedConfig.behaviorMode === 'SideBrain';
      if (local.isSideBranMode !== isSideBrainMode) {
        console.log({ isSideBrainMode });
        deviceService.setSideBrainMode(isSideBrainMode);
        local.isSideBranMode = isSideBrainMode;
      }
    }
    if (changedConfig.layoutStandard) {
      // console.log({ layout: changedConfig.layoutStandard });
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
      deviceService.writeSideBrainHidReport(report);
      prevHidReport = report.slice(0);
    }
  }

  async function initialize() {
    profileManager.subscribeStatus(onProfileStatusChanged);
    keyboardConfigProvider.subscribeStatus(onKeyboardConfigChanged);
    deviceService.subscribe(onRealtimeKeyboardEvent);
    tickerTimer.start(processTicker, 5);
  }

  async function terminate() {
    deviceService.unsubscribe(onRealtimeKeyboardEvent);
    if (local.isSideBranMode) {
      deviceService.setSideBrainMode(false);
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
