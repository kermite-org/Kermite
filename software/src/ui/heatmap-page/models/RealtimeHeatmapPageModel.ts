import { formatTimeMsToMinSecMs } from '~/shared';
import {
  ICustomKeyUnitViewModelBase,
  makeCustomKeyUnitViewModels,
} from '~/ui/common-svg/KeyUnitCardModels/CustomKeyUnitViewModel';
import { IHeatmapCustomKeyUnitViewModel } from '~/ui/common-svg/KeyUnitCards/HeatmapKeyUnitCard';
import { IRealtimeHeatmapKeyboardViewModel } from '~/ui/common-svg/panels/HeatmapKeyboardView';
import { useRealtimeHeatmapModel } from '~/ui/heatmap-page/models/RealtimeHeatmapModel';

export interface IRealtimeHeatmapPageModel {
  isRecording: boolean;
  startRecording(): void;
  stopRecording(): void;
  clearRecord(): void;
  hasRecord: boolean;
  numTotalTypes: number;
  timeText: string;
  keyboardVM: IRealtimeHeatmapKeyboardViewModel;
}

export function useRealtimeHeatmapPageModel(): IRealtimeHeatmapPageModel {
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
  } = useRealtimeHeatmapModel();

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
