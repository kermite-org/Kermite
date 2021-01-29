import {
  createFallbackDisplayKeyboardDesign,
  fallbackProfileData,
  IDisplayKeyboardDesign,
  IntervalTimerWrapper,
  IProfileData,
  IRealtimeKeyboardEvent,
} from '~/shared';
import { appUi, ipcAgent } from '~/ui-common';
import { DisplayKeyboardDesignLoader } from '~/ui-common/modules/DisplayKeyboardDesignLoader';

function translateKeyIndexToKeyUnitId(
  displayDesign: IDisplayKeyboardDesign,
  keyIndex: number,
): string | undefined {
  const keyEntity = displayDesign.keyEntities.find(
    (kp) => kp.keyIndex === keyIndex,
  );
  return keyEntity?.keyId;
}

export class RealtimeHeatmapModel {
  private timer = new IntervalTimerWrapper();

  profileData: IProfileData = fallbackProfileData;
  displayDesign: IDisplayKeyboardDesign = createFallbackDisplayKeyboardDesign();

  isRecording: boolean = false;
  numTotalTypes: number = 0;
  elapsedTimeMs: number = 0;
  typeStats: { [keyId: string]: number } = {};

  keyStates: { [keyId: string]: boolean } = {};

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
    if (e.type === 'keyStateChanged') {
      const keyUnitId = translateKeyIndexToKeyUnitId(
        this.displayDesign,
        e.keyIndex,
      );
      if (keyUnitId) {
        if (e.isDown && this.isRecording) {
          this.numTotalTypes++;
          if (this.typeStats[keyUnitId] === undefined) {
            this.typeStats[keyUnitId] = 0;
          }
          this.typeStats[keyUnitId]++;
        }
        this.keyStates[keyUnitId] = e.isDown;
      }
    }
  };

  startPageSession = () => {
    const unsub1 = ipcAgent.subscribe('profile_currentProfile', (profile) => {
      if (profile) {
        this.profileData = profile;
        this.displayDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
          profile.keyboardDesign,
        );
      }
    });
    const unsub2 = ipcAgent.subscribe(
      'device_keyEvents',
      this.handleKeyboardEvent,
    );
    return () => {
      unsub1();
      unsub2();
    };
  };
}

export const realtimeHeatmapModel = new RealtimeHeatmapModel();
