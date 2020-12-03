import { IRealtimeKeyboardEvent } from '~defs/IpcContract';
import { IntervalTimerWrapper } from '~shell/services/KeyboardLogic/helpers/IntervalTimerWrapper';
import { appUi, backendAgent } from '~ui/core';
import { EditorModel } from '~ui/models/editor/EditorModel';

export class RealtimeHeatmapModel {
  constructor(private editorModel: EditorModel) {}

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
    // 1キーごとに2回呼ばれるバグあり
    // xpcRendererで、同じイベントを複数箇所から購読した場合に、それぞれが複数回ずつ呼ばれるバグがある
    // これを回避するため、前回のイベントからの経過時間が短い場合には新しいイベントを無視する
    const timeStamp = Date.now();
    if (timeStamp - this.prevTimestamp < 20) {
      return;
    }
    this.prevTimestamp = timeStamp;

    if (e.type === 'keyStateChanged' && e.isDown && this.isRecording) {
      const keyUnitId = this.editorModel.translateKeyIndexToKeyUnitId(
        e.keyIndex
      );
      if (keyUnitId) {
        this.numTotalTypes++;
        if (this.typeStats[keyUnitId] === undefined) {
          this.typeStats[keyUnitId] = 0;
        }
        this.typeStats[keyUnitId]++;
      }
    }
  };

  initialize() {
    backendAgent.keyEvents.subscribe(this.handleKeyboardEvent);
  }

  finalize() {
    backendAgent.keyEvents.unsubscribe(this.handleKeyboardEvent);
  }
}
