import { IRealtimeKeyboardEvent, IProfileManagerStatus } from '~defs/ipc';
import { appGlobal } from '../appGlobal';
import { IInputLogicSimulator } from '../InputLogicSimulator.interface';
import {
  completeEditModelForShiftLayer,
  createKeyIndexToKeyUnitIdTable
} from '../InputLogicSimulator/EditModelFixer';
import { IntervalTimerWrapper } from '../InputLogicSimulator/IntervalTimerWrapper';
import {
  EventChannel,
  KeyAssignEvent,
  KeyIdKeyEvent,
  KeyIndexKeyEvent,
  KeyTriggerEvent,
  logicSimulatorState,
  setupChainGeneral
} from './common';
import { PrioritySorterModule } from './PrioritySorterModule';
import {
  KeyIndexToKeyIdConversionModule,
  TriggerDetectionModule,
  AssignMappingModule,
  AssignDriverModule
} from './modules';
import { IKeyAssignsSet_Single } from '~defs/ProfileData';

// class LogicClassModule<S, D> {
//   processEvents(src: IChannel<S>, dst: IChannel<D>) {}
//   processTicker() {}
// }

// class TriggerDetectionModule extends LogicClassModule<
//   KeyIdKeyEvent,
//   TriggerEvent
// > {
//   processEvents(src: IChannel<KeyIdKeyEvent>, dst: IChannel<TriggerEvent>) {}

//   processTicker() {}
// }

// interface AssignEvent {
//   keyId: string;
//   trigger: '';
//   assign: IAssign;
// }

// interface ActionEvent {
//   keyId: string;
//   action: IAction;
// }

export class InputLogicSimulatorB implements IInputLogicSimulator {
  private sorterIntervalTimer = new IntervalTimerWrapper();

  private onProfileStatusChanged = (
    changedStatus: Partial<IProfileManagerStatus>
  ) => {
    if (changedStatus.loadedEditModel) {
      const editModel = completeEditModelForShiftLayer(
        changedStatus.loadedEditModel
      );
      logicSimulatorState.keyAssignsProvider = {
        keyAssigns: editModel.assigns as IKeyAssignsSet_Single,
        keyUnitIdTable: createKeyIndexToKeyUnitIdTable(editModel)
      };
    }
  };

  rootChannel = new EventChannel<KeyIndexKeyEvent>();

  prioritySorterModule = new PrioritySorterModule();

  private setupChain() {
    const ch0 = this.rootChannel;
    const ch1 = new EventChannel<KeyIdKeyEvent>();
    const ch2 = new EventChannel<KeyTriggerEvent>();
    const ch3 = new EventChannel<KeyAssignEvent>();
    const ch4 = new EventChannel<KeyAssignEvent>();
    const ch5 = new EventChannel<KeyAssignEvent>();
    const ch99 = new EventChannel<any>();

    setupChainGeneral(KeyIndexToKeyIdConversionModule, ch0, ch1);
    TriggerDetectionModule.setupChain(ch1, ch2);
    setupChainGeneral(AssignMappingModule, ch2, ch3);
    this.prioritySorterModule.setupChain(ch3, ch4);
    setupChainGeneral(AssignDriverModule, ch4, ch5);
    // setupChainGeneral(traceModule, ch4, ch5);
  }

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      // console.log(`key ${keyIndex} ${isDown ? 'down' : 'up'}`);
      const ev0 = { keyIndex, isDown };
      this.rootChannel.emit(ev0);
    }
  };

  private processTicker = () => {
    TriggerDetectionModule.processTicker();
    this.prioritySorterModule.processTicker();
  };

  async initialize() {
    this.setupChain();
    appGlobal.profileManager.subscribeStatus(this.onProfileStatusChanged);
    appGlobal.deviceService.setSideBrainMode(true);
    appGlobal.deviceService.subscribe(this.onRealtimeKeyboardEvent);
    this.sorterIntervalTimer.start(this.processTicker, 10);
  }

  async terminate() {
    appGlobal.deviceService.unsubscribe(this.onRealtimeKeyboardEvent);
    appGlobal.deviceService.setSideBrainMode(false);
    this.sorterIntervalTimer.stop();
  }
}
