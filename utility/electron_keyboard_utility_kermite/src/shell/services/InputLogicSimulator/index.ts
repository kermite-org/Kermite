import { IProfileManagerStatus } from '~contract/data';
import { IRealtimeKeyboardEvent } from '~contract/ipc';
import { appGlobal } from '../appGlobal';
import {
  completeEditModelForShiftLayer,
  createKeyIndexToKeyUnitIdTable
} from './EditModelFixer';
import { VirtualKeyStateManager2 } from './VirtualStateManager2';
import { VirtualStateManager } from './VirtualStateManager';
import { IModelKeyAssignsProvider } from './Types';
import { LogicalKeyActionDriver } from './LogicalKeyActionDriver';

export class InputLogicSimulator {
  private keyAssignsProvider: IModelKeyAssignsProvider = {
    keyAssigns: {},
    keyUnitIdTable: []
  };

  private callApiKeyboardEvent = (keyCode: number, isDown: boolean) => {
    console.log(`    callApiKeyboardEvent __SIM__ ${keyCode} ${isDown}`);
    // callApiKeybdEventOriginal(keyCode, isDown);
    if (65 <= keyCode && keyCode < 68) {
      const scanCode = keyCode - 65 + 4;
      const report = [0, 0, isDown ? scanCode : 0, 0, 0, 0, 0, 0];
      appGlobal.deviceService.writeSideBrainHidReport(report);
    }
  };

  private onProfileManagerStatusChanged = (
    changedStatus: Partial<IProfileManagerStatus>
  ) => {
    if (changedStatus.loadedEditModel) {
      const editModel = completeEditModelForShiftLayer(
        changedStatus.loadedEditModel
      );
      this.keyAssignsProvider = {
        keyAssigns: editModel.keyAssigns,
        keyUnitIdTable: createKeyIndexToKeyUnitIdTable(editModel)
      };
    }
  };

  private onRealtimeKeyboardEvent = (event: IRealtimeKeyboardEvent) => {
    if (event.type === 'keyStateChanged') {
      const { keyIndex, isDown } = event;
      if (keyIndex === 12) {
        console.log('');
        return;
      }
      console.log(`key ${keyIndex} ${isDown ? 'down' : 'up'}`);

      const mode: number = 1;

      if (mode === 0) {
        VirtualStateManager.handleHardwareKeyStateEvent(
          keyIndex,
          isDown,
          this.keyAssignsProvider
        );
      } else if (mode === 1) {
        VirtualKeyStateManager2.handleHardwareKeyStateEvent(
          keyIndex,
          isDown,
          this.keyAssignsProvider
        );
      }
    }
    if (event.type === 'layerChanged') {
      console.log(`layer ${event.layerIndex}`);
    }
  };

  async initialize() {
    appGlobal.profileManager.subscribeStatus(
      this.onProfileManagerStatusChanged
    );
    appGlobal.deviceService.subscribe(this.onRealtimeKeyboardEvent);

    LogicalKeyActionDriver.setKeyDestinationProc(this.callApiKeyboardEvent);
    VirtualKeyStateManager2.start();

    appGlobal.deviceService.writeSideBrainMode(true);
  }

  async terminate() {
    appGlobal.deviceService.unsubscribe(this.onRealtimeKeyboardEvent);

    appGlobal.deviceService.writeSideBrainMode(false);
  }
}
