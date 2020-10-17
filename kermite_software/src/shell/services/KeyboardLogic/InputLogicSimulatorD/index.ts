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
import { getKeyboardCoreLogicInterface } from './DeviceCoreLogicSimulator2_Dual';
import { makeKeyAssignsConfigStorageData } from './ProfileDataBinaryPacker';

function compareArray(ar0: any[], ar1: any[]): boolean {
  return (
    ar0.length === ar1.length &&
    generateNumberSequence(ar0.length).every((i) => ar0[i] === ar1[i])
  );
}

function createTimeIntervalCounter() {
  let prevTick = Date.now();
  return () => {
    const tick = Date.now();
    const elapsedMs = tick - prevTick;
    prevTick = tick;
    return elapsedMs;
  };
}

function copyBytes(dst: number[], src: number[], len: number) {
  for (let i = 0; i < len; i++) {
    dst[i] = src[i];
  }
}

class ConfigDataStorage {
  readonly StorageBufCapacity = 1024;
  storageBuf: number[] = Array(this.StorageBufCapacity).fill(0);

  writeConfigStorageData(bytes: number[]) {
    const len = bytes.length;
    if (len < this.StorageBufCapacity) {
      this.storageBuf.fill(0);
      copyBytes(this.storageBuf, bytes, len);
    }
  }

  readByte(addr: number) {
    return this.storageBuf[addr];
  }
}

export namespace InputLogicSimulatorD {
  const CL = getKeyboardCoreLogicInterface();

  const tickerTimer = new IntervalTimerWrapper();

  const local = new (class {
    isSideBranMode: boolean = false;
  })();

  const configDataStorage = new ConfigDataStorage();

  function updateProfileDataBlob() {
    const prof = profileManager.getCurrentProfile();
    const layoutStandard = keyboardConfigProvider.keyboardConfig.layoutStandard;
    if (prof && layoutStandard) {
      const bytes = makeKeyAssignsConfigStorageData(prof, layoutStandard);
      configDataStorage.writeConfigStorageData(bytes);
      CL.keyboardCoreLogic_initialize();
      CL.keyboardCoreLogic_setAssignStorageReaderFunc((addr) =>
        configDataStorage.readByte(addr)
      );
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
      CL.keyboardCoreLogic_issuePhysicalKeyStateChanged(keyIndex, isDown);
    }
  }

  let layerActiveFlags: number = 0;
  let hidReportBytes: number[] = new Array(8).fill(0);

  const tickUpdator = createTimeIntervalCounter();

  function processTicker() {
    const elapsedMs = tickUpdator();
    CL.keyboardCoreLogic_processTicker(elapsedMs);
    const report = CL.keyboardCoreLogic_getOutputHidReportBytes();
    if (!compareArray(hidReportBytes, report)) {
      deviceService.writeSideBrainHidReport(report);
      hidReportBytes = report.slice(0);
    }
    const newLayerActiveFlags = CL.keyboardCoreLogic_getLayerActiveFlags();
    if (newLayerActiveFlags !== layerActiveFlags) {
      const flagsArray = generateNumberSequence(16).map(
        (i) => ((newLayerActiveFlags >> i) & 1) > 0
      );
      deviceService.emitLayerChangedEvent(flagsArray);
      layerActiveFlags = newLayerActiveFlags;
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
