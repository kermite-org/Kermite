import {
  IKeyUnitEntry,
  ILayer,
  IProfileData,
  IProfileDataAssigns,
} from '~shared/defs/ProfileData';
import {
  getAssignEntryTexts,
  getAssignForKeyUnitWithLayerFallback,
} from '~ui/viewModels/KeyUnitCard/KeyUnitCardViewModelCommon';

export interface IPresetKeyUnitViewModel {
  keyUnitId: string;
  pos: {
    x: number;
    y: number;
    r: number;
  };
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
}

function createPresetKeyUnitViewModel(
  ku: IKeyUnitEntry,
  targetLayerId: string,
  layers: ILayer[],
  assigns: IProfileDataAssigns,
): IPresetKeyUnitViewModel {
  const keyUnitId = ku.id;
  const pos = {
    x: ku.x,
    y: ku.y,
    r: ku.r || 0,
  };

  const assign = getAssignForKeyUnitWithLayerFallback(
    keyUnitId,
    targetLayerId,
    layers,
    assigns,
  );

  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign,
    layers,
  );

  return {
    keyUnitId,
    pos,
    primaryText,
    secondaryText,
    isLayerFallback,
  };
}

export function makePresetKeyUnitViewModels(
  profileData: IProfileData,
  targetLayerId: string,
): IPresetKeyUnitViewModel[] {
  const { layers, assigns, keyboardShape } = profileData;
  return keyboardShape.keyUnits.map((ku) => {
    return createPresetKeyUnitViewModel(ku, targetLayerId, layers, assigns);
  });
}
