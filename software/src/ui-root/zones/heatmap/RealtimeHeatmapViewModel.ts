import {
  formatTimeMsToMinSecMs,
  IDisplayArea,
  IDisplayOutlineShape,
} from '~/shared';
import { playerModel } from '~/ui-root/zones/common/commonModels/PlayerModel';
import {
  makeCustomKeyUnitViewModels,
  ICustomKeyUnitViewModelBase,
} from '~/ui-root/zones/common/commonViewModels/KeyUnitCard/CustomKeyUnitViewModel';
import { editorModel } from '~/ui-root/zones/editor/models/EditorModel';
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
  } = realtimeHeatmapModel;

  const { typeStats, maxKeyTypeCount } = realtimeHeatmapModel;

  const cardsVM = makeCustomKeyUnitViewModels(
    editorModel.profileData,
    editorModel.displayDesign,
    'la0',
    (source: ICustomKeyUnitViewModelBase): IHeatmapCustomKeyUnitViewModel => {
      const typeCount = typeStats[source.keyUnitId];
      const weight = (typeCount || 0) / maxKeyTypeCount;
      const hold = playerModel.keyStates[source.keyUnitId];
      return {
        ...source,
        typeCount,
        weight,
        hold,
      };
    },
  );

  const { displayArea, outlineShapes } = editorModel.displayDesign;

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
