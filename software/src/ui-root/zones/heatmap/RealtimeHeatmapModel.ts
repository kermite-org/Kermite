import { IntervalTimerWrapper, IRealtimeKeyboardEvent } from '~/shared';
import { appUi, ipcAgent } from '~/ui-common';
import { editorModel } from '~/ui-root/zones/editor/models/EditorModel';

export class RealtimeHeatmapModel {
  private timer = new IntervalTimerWrapper();

  isRecording: boolean = false;
  numTotalTypes: number = 0;
  elapsedTimeMs: number = 0;
  typeStats: { [keyId: string]: number } = {};

  get maxKeyTypeCount() {
    return Math.max(...Object.values(this.typeStats));
  }

  clearRecord = () => {
    this.numTotalTypes = 0;
    this.elapsedTimeMs = 0;
    this.typeStats = {};
  };

  startRecording = () => {
    this.isRecording = true;
    this.clearRecord();

    let t0 = Date.now();
    this.timer.start(() => {
      const t1 = Date.now();
      this.elapsedTimeMs += t1 - t0;
      t0 = t1;
      appUi.rerender();
    }, 100);
  };

  stopRecording = () => {
    this.isRecording = false;
    this.timer.stop();
  };

  prevTimestamp: number = 0;

  handleKeyboardEvent = (e: IRealtimeKeyboardEvent) => {
    if (e.type === 'keyStateChanged' && e.isDown && this.isRecording) {
      const keyUnitId = editorModel.translateKeyIndexToKeyUnitId(e.keyIndex);
      if (keyUnitId) {
        this.numTotalTypes++;
        if (this.typeStats[keyUnitId] === undefined) {
          this.typeStats[keyUnitId] = 0;
        }
        this.typeStats[keyUnitId]++;
      }
    }
  };

  startPageSession = () => {
    return ipcAgent.subscribe('device_keyEvents', this.handleKeyboardEvent);
  };
}

export const realtimeHeatmapModel = new RealtimeHeatmapModel();
