import { Hook } from 'qx';
import {
  createFallbackDisplayKeyboardDesign,
  fallbackProfileData,
  IDisplayKeyboardDesign,
  IntervalTimerWrapper,
  IProfileData,
  IRealtimeKeyboardEvent,
} from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { appUi, ipcAgent } from '~/ui/common';

interface IRealtimeHeatmapModel {
  isRecording: boolean;
  startRecording(): void;
  stopRecording(): void;
  clearRecord(): void;
  profileData: IProfileData;
  displayDesign: IDisplayKeyboardDesign;
  numTotalTypes: number;
  elapsedTimeMs: number;
  typeStats: { [keyId: string]: number };
  keyStates: { [keyId: string]: boolean };
  maxKeyTypeCount: number;
  startPageSession(): void;
}

function translateKeyIndexToKeyUnitId(
  displayDesign: IDisplayKeyboardDesign,
  keyIndex: number,
): string | undefined {
  const keyEntity = displayDesign.keyEntities.find(
    (kp) => kp.keyIndex === keyIndex,
  );
  return keyEntity?.keyId;
}

class RealtimeHeatmapModel implements IRealtimeHeatmapModel {
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

  private handleKeyboardEvent = (e: IRealtimeKeyboardEvent) => {
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

  private async fetchData() {
    const profile = await ipcAgent.async.profile_getCurrentProfile();
    this.profileData = profile;
    this.displayDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
      profile.keyboardDesign,
    );
  }

  startPageSession = () => {
    this.fetchData();
    return ipcAgent.events.device_keyEvents.subscribe(this.handleKeyboardEvent);
  };
}

export function useRealtimeHeatmapModel(): IRealtimeHeatmapModel {
  const heatmapModel = Hook.useMemo(() => new RealtimeHeatmapModel(), []);
  Hook.useEffect(heatmapModel.startPageSession, []);
  return heatmapModel;
}
