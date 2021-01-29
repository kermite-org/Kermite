import {
  formatTimeMsToMinSecMs,
  IDisplayArea,
  IDisplayOutlineShape,
} from '~/shared';
import {
  makeCustomKeyUnitViewModels,
  ICustomKeyUnitViewModelBase,
} from '~/ui-root/zones/common/commonViewModels/KeyUnitCard/CustomKeyUnitViewModel';
import { realtimeHeatmapModel } from '~/ui-root/zones/heatmap/RealtimeHeatmapModel';

export interface IHeatmapCustomKeyUnitViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
  typeCount: number;
  weight: number;
  hold: boolean;
}

export interface IRealtimeHeatmapKeyboardViewModel {
  cardsVM: IHeatmapCustomKeyUnitViewModel[];
  outlineShapes: IDisplayOutlineShape[];
  displayArea: IDisplayArea;
}

export interface IRealtimeHeatmapViewModel {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  clearRecord: () => void;
  hasRecord: boolean;
  numTotalTypes: number;
  timeText: string;
  keyboardVM: IRealtimeHeatmapKeyboardViewModel;
}

export function makeRealtimeHeatmapViewModel(): IRealtimeHeatmapViewModel {
  const {
    isRecording,
    startRecording,
    stopRecording,
    clearRecord,
    elapsedTimeMs,
    numTotalTypes,
    keyStates,
    typeStats,
    maxKeyTypeCount,
    profileData,
    displayDesign,
  } = realtimeHeatmapModel;

  const cardsVM =
    makeCustomKeyUnitViewModels(
      profileData,
      displayDesign,
      'la0',
      (source: ICustomKeyUnitViewModelBase): IHeatmapCustomKeyUnitViewModel => {
        const typeCount = typeStats[source.keyUnitId];
        const weight = (typeCount || 0) / maxKeyTypeCount;
        const hold = keyStates[source.keyUnitId];
        return {
          ...source,
          typeCount,
          weight,
          hold,
        };
      },
    ) || [];

  const { displayArea, outlineShapes } = displayDesign;

  return {
    isRecording,
    startRecording,
    stopRecording,
    clearRecord,
    hasRecord: numTotalTypes > 0,
    timeText: formatTimeMsToMinSecMs(elapsedTimeMs),
    numTotalTypes,
    keyboardVM: {
      cardsVM,
      displayArea,
      outlineShapes,
    },
  };
}
