import { useState, useEffect } from 'qx';
import {
  IDisplayArea,
  IDisplayOutlineShape,
  IProfileData,
  getDisplayKeyboardDesignSingleCached,
} from '~/shared';
import { IPresetKeyUnitViewModel } from '~/ui/base';
import { makePresetKeyUnitViewModels } from '~/ui/elements';

export interface IPresetKeyboardSectionModel {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
  layers: {
    layerId: string;
    layerName: string;
  }[];
  currentLayerId: string;
  setCurrentLayerId(layerId: string): void;
}

export function usePresetKeyboardSectionModel(
  profileData: IProfileData,
): IPresetKeyboardSectionModel {
  const [currentLayerId, setCurrentLayerId] = useState('');
  useEffect(() => {
    setCurrentLayerId('');
  }, [profileData]);

  const displayDesign = getDisplayKeyboardDesignSingleCached(
    profileData.keyboardDesign,
  );
  const keyUnits = makePresetKeyUnitViewModels(
    profileData,
    displayDesign,
    currentLayerId,
  );
  const displayArea = displayDesign.displayArea;
  const outlineShapes = displayDesign.outlineShapes;

  const layers = profileData.layers.map((la) => ({
    layerId: la.layerId,
    layerName: la.layerName,
  }));

  return {
    keyUnits,
    displayArea,
    outlineShapes,
    layers,
    currentLayerId,
    setCurrentLayerId,
  };
}
