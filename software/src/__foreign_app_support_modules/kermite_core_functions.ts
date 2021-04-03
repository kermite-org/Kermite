import {
  createDictionaryFromKeyValues,
  IDisplayArea,
  IDisplayKeyEntity,
  IDisplayKeyShape,
  IDisplayOutlineShape,
  ILayer,
  IPersistProfileData,
  IProfileData,
} from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { ProfileDataConverter } from '~/shell/loaders/ProfileDataConverter';
import {
  getAssignEntryTexts,
  getAssignForKeyUnitWithLayerFallback,
} from '~/ui-common-svg/KeyUnitCardModels/KeyUnitCardViewModelCommon';

interface IKeyUnitDisplayModel {
  keyId: string;
  x: number;
  y: number;
  angle: number;
  shape: IDisplayKeyShape;
}

interface IKeyUnitTextDisplayModel {
  primaryText: string;
  secondaryText: string;
  isLayerFallback: boolean;
}

type IKeyUnitTextDisplayModelsDict = {
  [keyId in string]: IKeyUnitTextDisplayModel;
};

interface IProfileLayersDisplayModel {
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
  keyUnits: IKeyUnitDisplayModel[];
  completeKeyUnitTexts: IKeyUnitTextDisplayModelsDict;
  layerKeyUnitTexts: { [layerId in string]: IKeyUnitTextDisplayModelsDict };
}

function createKeyUnitTextDisplayModel(
  ke: IDisplayKeyEntity,
  targetLayerId: string,
  layers: ILayer[],
  assigns: IProfileData['assigns'],
): IKeyUnitTextDisplayModel {
  const keyId = ke.keyId;
  const assign = getAssignForKeyUnitWithLayerFallback(
    keyId,
    targetLayerId,
    layers,
    assigns,
  );
  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign,
    layers,
  );
  return {
    primaryText,
    secondaryText,
    isLayerFallback,
  };
}

function createProfileLayersDisplayModel(
  persistProfileData: IPersistProfileData,
): IProfileLayersDisplayModel {
  const profileData = ProfileDataConverter.convertProfileDataFromPersist(
    persistProfileData,
  );
  const keyboardDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
    profileData.keyboardDesign,
  );
  const keyUnits = keyboardDesign.keyEntities.map((ke) => ({
    keyId: ke.keyId,
    x: ke.x,
    y: ke.y,
    angle: ke.angle || 0,
    shape: ke.shape,
  }));

  const { layers, assigns } = profileData;

  const layerKeyUnitTexts = createDictionaryFromKeyValues(
    layers.map((la) => {
      const keyUnitTextDisplayModelsDict = createDictionaryFromKeyValues(
        keyboardDesign.keyEntities.map((ke) => {
          const textDispalyModel = createKeyUnitTextDisplayModel(
            ke,
            la.layerId,
            layers,
            assigns,
          );
          return [ke.keyId, textDispalyModel];
        }),
      );
      return [la.layerId, keyUnitTextDisplayModelsDict];
    }),
  );
  const completeKeyUnitTexts = layerKeyUnitTexts.la0;

  return {
    displayArea: keyboardDesign.displayArea,
    outlineShapes: keyboardDesign.outlineShapes,
    keyUnits,
    layerKeyUnitTexts,
    completeKeyUnitTexts,
  };
}

(window as any).KermiteCoreFunctions = {
  createProfileLayersDisplayModel,
};
