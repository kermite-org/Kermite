import {
  generateNumberSequence,
  ICoreState,
  IKeyboardConfig,
  IntervalTimerWrapper,
  IProfileData,
  IRealtimeKeyboardEvent,
  SystemParameter,
} from '~/shared';
import { withAppErrorHandler } from '~/shell/base/errorChecker';
import { coreStateManager } from '~/shell/modules/core';
import { KeyboardDeviceService } from '~/shell/services/keyboardDevice';
import { dataStorage } from '~/shell/services/keyboardLogic/dataStorage';
import { getKeyboardCoreLogicInterface } from './keyboardCoreLogicImplementation';
import { makeProfileBinaryData } from './profileDataBinaryPacker';

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
export class InputLogicSimulator {
  private CL = getKeyboardCoreLogicInterface();
  private tickerTimer = new IntervalTimerWrapper();
  private isSimulatorMode: boolean = false;
  private isMuteMode: boolean = false;
  private layerActiveFlags: number = 0;
  private hidReportBytes: number[] = new Array(8).fill(0);

  private tickUpdater = createTimeIntervalCounter();

  constructor(private deviceService: KeyboardDeviceService) {}

  private get simulationActive(): boolean {
    return this.isSimulatorMode && !this.isMuteMode;
  }

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      if (this.simulationActive) {
        this.CL.keyboardCoreLogic_issuePhysicalKeyStateChanged(
          keyIndex,
          isDown,
        );
      } else {
        console.log(`${event.isDown ? 'keydown' : 'keyup'} ${event.keyIndex}`);
      }
    }
  };

  private keyboardConfigHandler = (config: IKeyboardConfig) => {
    const { isSimulatorMode, isMuteMode } = config;
    if (this.isSimulatorMode !== isSimulatorMode) {
      this.deviceService.setSimulatorMode(isSimulatorMode);
      this.isSimulatorMode = isSimulatorMode;
    }
    if (this.isMuteMode !== isMuteMode) {
      this.deviceService.setMuteMode(isMuteMode);
      this.isMuteMode = isMuteMode;
    }
  };

  private onCoreStatusChange = (diff: Partial<ICoreState>) => {
    if (diff.deviceStatus) {
      const values =
        diff.deviceStatus.isConnected &&
        diff.deviceStatus.systemParameterValues;
      if (values) {
        const systemLayout = values[SystemParameter.SystemLayout];
        const wiringMode = values[SystemParameter.WiringMode];
        // console.log(`systemlayout: ${systemLayout}, wiringMode: ${wiringMode}`);
        this.CL.keyboardCoreLogic_setSystemLayout(systemLayout);
        this.CL.keyboardCoreLogic_setWiringMode(wiringMode);
      }
    }
    if (diff.keyboardConfig) {
      this.keyboardConfigHandler(diff.keyboardConfig);
    }

    if (diff.editProfileData) {
      this.loadSimulationProfile(diff.editProfileData);
    }
  };

  private processTicker = () => {
    const elapsedMs = this.tickUpdater();

    if (this.simulationActive) {
      this.CL.keyboardCoreLogic_processTicker(elapsedMs);

      const report = this.CL.keyboardCoreLogic_getOutputHidReportBytes();
      if (!compareArray(this.hidReportBytes, report)) {
        this.deviceService.writeSimulatorHidReport(report);
        this.hidReportBytes = report.slice(0);
      }
      const newLayerActiveFlags =
        this.CL.keyboardCoreLogic_getLayerActiveFlags();
      if (newLayerActiveFlags !== this.layerActiveFlags) {
        this.deviceService.emitRealtimeEventFromSimulator({
          type: 'layerChanged',
          layerActiveFlags: newLayerActiveFlags,
        });
        this.layerActiveFlags = newLayerActiveFlags;
      }
    }
  };

  private loadSimulationProfile(profile: IProfileData) {
    const bytes = makeProfileBinaryData(profile);
    dataStorage.writeBinaryProfileData(bytes);
    this.CL.keyboardCoreLogic_initialize();
  }

  initialize() {
    this.deviceService.realtimeEventPort.subscribe(
      this.onRealtimeKeyboardEvent,
    );
    coreStateManager.coreStateEventPort.subscribe(this.onCoreStatusChange);
    this.tickerTimer.start(
      withAppErrorHandler(
        this.processTicker,
        'InputLogicSimulatorD_processTicker',
      ),
      5,
    );
  }

  terminate() {
    this.deviceService.realtimeEventPort.unsubscribe(
      this.onRealtimeKeyboardEvent,
    );
    coreStateManager.coreStateEventPort.unsubscribe(this.onCoreStatusChange);
    this.tickerTimer.stop();
  }
}
