import { IKeyboardConfig } from '~defs/ConfigTypes';
import {
  IProfileManagerStatus,
  IRealtimeKeyboardEvent
} from '~defs/IpcContract';
import { generateNumberSequence } from '~funcs/Utils';
import { KeyboardConfigProvider } from '~shell/services/KeyboardConfigProvider';
import { KeyboardDeviceService } from '~shell/services/KeyboardDevice';
import { ProfileManager } from '~shell/services/ProfileManager';
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

export class InputLogicSimulatorD {
  private CL = getKeyboardCoreLogicInterface();
  private tickerTimer = new IntervalTimerWrapper();
  private isSideBranMode: boolean = false;
  private configDataStorage = new ConfigDataStorage();

  private layerActiveFlags: number = 0;
  private hidReportBytes: number[] = new Array(8).fill(0);

  private tickUpdator = createTimeIntervalCounter();

  constructor(
    private profileManager: ProfileManager,
    private keyboardConfigProvider: KeyboardConfigProvider,
    private deviceService: KeyboardDeviceService
  ) {}

  private updateProfileDataBlob() {
    const prof = this.profileManager.getCurrentProfile();
    const layoutStandard = this.keyboardConfigProvider.keyboardConfig
      .layoutStandard;
    if (prof && layoutStandard) {
      const bytes = makeKeyAssignsConfigStorageData(prof, layoutStandard);
      this.configDataStorage.writeConfigStorageData(bytes);
      this.CL.keyboardCoreLogic_initialize();
      this.CL.keyboardCoreLogic_setAssignStorageReaderFunc((addr) =>
        this.configDataStorage.readByte(addr)
      );
    }
  }

  private onProfileStatusChanged = (
    changedStatus: Partial<IProfileManagerStatus>
  ) => {
    if (changedStatus.loadedProfileData) {
      // console.log(`logicSimulator, profile data received`);
      this.updateProfileDataBlob();
    }
  };

  private onKeyboardConfigChanged = (
    changedConfig: Partial<IKeyboardConfig>
  ) => {
    if (changedConfig.behaviorMode) {
      const isSideBrainMode = changedConfig.behaviorMode === 'SideBrain';
      if (this.isSideBranMode !== isSideBrainMode) {
        console.log(
          `logic mode: ${isSideBrainMode ? 'SideBrain' : 'Standalone'}`
        );
        this.deviceService.setSideBrainMode(isSideBrainMode);
        this.isSideBranMode = isSideBrainMode;
      }
    }
    if (changedConfig.layoutStandard) {
      this.updateProfileDataBlob();
    }
  };

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      this.CL.keyboardCoreLogic_issuePhysicalKeyStateChanged(keyIndex, isDown);
    }
  };

  processTicker = () => {
    const elapsedMs = this.tickUpdator();
    this.CL.keyboardCoreLogic_processTicker(elapsedMs);

    if (this.isSideBranMode) {
      const report = this.CL.keyboardCoreLogic_getOutputHidReportBytes();
      if (!compareArray(this.hidReportBytes, report)) {
        this.deviceService.writeSideBrainHidReport(report);
        this.hidReportBytes = report.slice(0);
      }
      const newLayerActiveFlags = this.CL.keyboardCoreLogic_getLayerActiveFlags();
      if (newLayerActiveFlags !== this.layerActiveFlags) {
        this.deviceService.emitRealtimeEventFromSimulator({
          type: 'layerChanged',
          layerActiveFlags: newLayerActiveFlags
        });
        this.layerActiveFlags = newLayerActiveFlags;
      }
      const assignHitResult = this.CL.keyboardCoreLogic_peekAssignHitResult();
      if (assignHitResult !== 0) {
        const keyIndex = assignHitResult & 0xff;
        const layerIndex = (assignHitResult >> 8) & 0x0f;
        const prioritySpec = (assignHitResult >> 12) & 0x03;
        this.deviceService.emitRealtimeEventFromSimulator({
          type: 'assignHit',
          layerIndex,
          keyIndex,
          prioritySpec
        });
      }
    }
  };

  initialize() {
    this.profileManager.statusEventPort.subscribe(this.onProfileStatusChanged);
    this.keyboardConfigProvider.configStatus.subscribe(
      this.onKeyboardConfigChanged
    );
    this.deviceService.realtimeEventPort.subscribe(
      this.onRealtimeKeyboardEvent
    );
    this.tickerTimer.start(this.processTicker, 5);
  }

  terminate() {
    this.profileManager.statusEventPort.unsubscribe(
      this.onProfileStatusChanged
    );
    this.keyboardConfigProvider.configStatus.subscribe(
      this.onKeyboardConfigChanged
    );
    this.deviceService.realtimeEventPort.unsubscribe(
      this.onRealtimeKeyboardEvent
    );
    if (this.isSideBranMode) {
      this.deviceService.setSideBrainMode(false);
      this.isSideBranMode = false;
    }
    this.tickerTimer.stop();
  }
}
