import { useState, useEffect } from 'alumina';
import {
  IDisplayArea,
  IDisplayOutlineShape,
  IProfileData,
  getDisplayKeyboardDesignSingleCached,
  IDisplayExtraShape,
} from '~/shared';
import { IPresetKeyUnitViewModel } from '~/ui/base';
import { makePresetKeyUnitViewModels } from '~/ui/elements';

export interface IPresetKeyboardSectionModel {
  keyUnits: IPresetKeyUnitViewModel[];
  displayArea: IDisplayArea;
  outlineShapes: IDisplayOutlineShape[];
  extraShapes: IDisplayExtraShape[];
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
  const { displayArea, outlineShapes, extraShapes } = displayDesign;

  const layers = profileData.layers.map((la) => ({
    layerId: la.layerId,
    layerName: la.layerName,
  }));

  return {
    keyUnits,
    displayArea,
    outlineShapes,
    extraShapes,
    layers,
    currentLayerId,
    setCurrentLayerId,
  };
}
