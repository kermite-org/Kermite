import {
  convertNullToUndefinedRecursive,
  createDictionaryFromKeyValues,
  DisplayKeyboardDesignLoader,
  IDisplayArea,
  IDisplayExtraShape,
  IDisplayKeyEntity,
  IDisplayKeyShape,
  IDisplayOutlineShape,
  ILayer,
  IPersistProfileData,
  IProfileData,
  IProjectPackageFileContent,
  ProfileDataConverter,
} from '~/shared';
import { ProfileDataMigrator } from '~/shell/loaders/profileDataMigrator';
import {
  getAssignEntryTexts,
  getAssignForKeyUnitInInitialLayerStack,
  getAssignForKeyUnitWithLayerFallback,
} from '~/ui/elements';

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

interface ILayerDisplayModel {
  layerId: string;
  layerName: string;
}

interface IProfileLayersDisplayModel {
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
  layers: ILayerDisplayModel[];
  keyUnits: IKeyUnitDisplayModel[];
  completedKeyUnitTexts: IKeyUnitTextDisplayModelsDict;
  extraShapes: IDisplayExtraShape[];
}

function createKeyUnitTextDisplayModel(
  ke: IDisplayKeyEntity,
  targetLayerId: string | undefined,
  layers: ILayer[],
  assigns: IProfileData['assigns'],
): IKeyUnitTextDisplayModel {
  const keyUnitId = ke.keyId;
  const assign = targetLayerId
    ? getAssignForKeyUnitWithLayerFallback(
        keyUnitId,
        targetLayerId,
        layers,
        assigns,
      )
    : getAssignForKeyUnitInInitialLayerStack(keyUnitId, layers, assigns);

  const { primaryText, secondaryText, isLayerFallback } = getAssignEntryTexts(
    assign,
    layers,
    {
      assignType: 'single',
      shiftCancelMode: 'none',
    },
  );
  return {
    primaryText,
    secondaryText,
    isLayerFallback,
  };
}

function createProfileLayersDisplayModel(
  sourcePersistProfileData: IPersistProfileData,
): IProfileLayersDisplayModel {
  const nullReplaced = convertNullToUndefinedRecursive(
    sourcePersistProfileData,
  ) as IPersistProfileData;
  const formatFixed = ProfileDataMigrator.fixProfileData(nullReplaced);
  const profileData =
    ProfileDataConverter.convertProfileDataFromPersist(formatFixed);
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

  const outLayers = layers.map((la) => ({
    layerId: la.layerId,
    layerName: la.layerName,
  }));
  const completedKeyUnitTexts = createDictionaryFromKeyValues(
    keyboardDesign.keyEntities.map((ke) => {
      const textDisplayModel = createKeyUnitTextDisplayModel(
        ke,
        undefined,
        layers,
        assigns,
      );
      return [ke.keyId, textDisplayModel];
    }),
  );

  return {
    displayArea: keyboardDesign.displayArea,
    outlineShapes: keyboardDesign.outlineShapes,
    extraShapes: keyboardDesign.extraShapes,
    layers: outLayers,
    keyUnits,
    completedKeyUnitTexts,
  };
}

function createProfileLayersDisplayModelFromPackage(
  inputPackage: IProjectPackageFileContent,
): IProfileLayersDisplayModel {
  const sourcePackage = convertNullToUndefinedRecursive(
    inputPackage,
  ) as IProjectPackageFileContent;
  const keyboardDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
    sourcePackage.layouts[0].data,
  );
  const keyUnits = keyboardDesign.keyEntities.map((ke) => ({
    keyId: ke.keyId,
    x: ke.x,
    y: ke.y,
    angle: ke.angle || 0,
    shape: ke.shape,
  }));
  return {
    displayArea: keyboardDesign.displayArea,
    outlineShapes: keyboardDesign.outlineShapes,
    extraShapes: keyboardDesign.extraShapes,
    layers: [{ layerId: 'la0', layerName: 'main' }],
    keyUnits,
    completedKeyUnitTexts: {},
  };
}

(window as any).KermiteCoreFunctions = {
  createProfileLayersDisplayModel,
  createProfileLayersDisplayModelFromPackage,
};
