import { IKeyboardShapeDisplayArea } from '~defs/ProfileData';
import { formatTimeMsToMinSecMs } from '~funcs/Utils';
import { models } from '~ui/models';
import {
  ICustomKeyUnitViewModelBase,
  makeCustomKeyUnitViewModels
} from '~ui/viewModels/KeyUnitCard/CustomKeyUnitViewModel';

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
}

export interface IRealtimeHeatmapKeyboardViewModel {
  cardsVM: IHeatmapCustomKeyUnitViewModel[];
  bodyPathMarkupText: string;
  displayArea: IKeyboardShapeDisplayArea;
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
    numTotalTypes
  } = models.realtimeHeatmapModel;

  const { typeStats, maxKeyTypeCount } = models.realtimeHeatmapModel;

  const cardsVM = makeCustomKeyUnitViewModels(
    models.editorModel.profileData,
    'la0',
    (source: ICustomKeyUnitViewModelBase) => {
      const typeCount = typeStats[source.keyUnitId];
      const weight = (typeCount || 0) / maxKeyTypeCount;
      return {
        ...source,
        typeCount,
        weight
      };
    }
  );

  const {
    displayArea,
    bodyPathMarkupText
  } = models.editorModel.profileData.keyboardShape;

  return {
    isRecording,
    startRecording,
    stopRecording,
    clearRecord,
    hasRecord: numTotalTypes > 0,
    timeText: formatTimeMsToMinSecMs(elapsedTimeMs),
    numTotalTypes,
    keyboardVM: { cardsVM, displayArea, bodyPathMarkupText }
  };
}
