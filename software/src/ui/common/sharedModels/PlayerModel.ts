import { Hook } from 'qx';
import {
  addArrayItemIfNotExist,
  createFallbackDisplayKeyboardDesign,
  fallbackProfileData,
  IAssignEntry,
  IAssignOperation,
  IDisplayKeyboardDesign,
  ILayer,
  IProfileData,
  IRealtimeKeyboardEvent,
  removeArrayItems,
} from '~/shared';
import { DisplayKeyboardDesignLoader } from '~/shared/modules/DisplayKeyboardDesignLoader';
import { ipcAgent } from '~/ui/common/base';
import {
  ILayerStackItem,
  IPlayerModel,
} from '~/ui/common/sharedModels/Interfaces';

function translateKeyIndexToKeyUnitId(
  keyIndex: number,
  profileData: IProfileData,
): string | undefined {
  const keyEntity = profileData.keyboardDesign.keyEntities.find(
    (kp) => kp.keyIndex === keyIndex,
  );
  return keyEntity?.keyId;
}

function isOperationShift(op: IAssignOperation | undefined) {
  return op?.type === 'keyInput' && op.virtualKey === 'K_Shift';
}

function isAssignShift(assign: IAssignEntry | undefined) {
  if (assign?.type === 'single') {
    return isOperationShift(assign.op);
  }
  if (assign?.type === 'dual') {
    return (
      isOperationShift(assign.primaryOp) || isOperationShift(assign.secondaryOp)
    );
  }
}

function isLayerActive(layerStateFlags: number, layerIndex: number) {
  return ((layerStateFlags >> layerIndex) & 1) > 0;
}

function makeLayerStackItems(
  layers: ILayer[],
  layerActiveFlags: number,
): ILayerStackItem[] {
  return layers.map((la, index) => ({
    layerId: la.layerId,
    layerName: la.layerName,
    isActive: isLayerActive(layerActiveFlags, index),
  }));
}

function getDynamicKeyAssign(
  profileData: IProfileData,
  layerStateFlags: number,
  keyUnitId: string,
): IAssignEntry | undefined {
  const { layers } = profileData;
  for (let i = layers.length - 1; i >= 0; i--) {
    if (isLayerActive(layerStateFlags, i)) {
      const layer = layers[i];
      const assign = profileData.assigns[`${layer.layerId}.${keyUnitId}`];

      if (assign?.type === 'transparent') {
        continue;
      }
      if (assign?.type === 'block') {
        return undefined;
      }
      if (!assign && layer.defaultScheme === 'block') {
        return undefined;
      }
      if (assign) {
        return assign;
      }
    }
  }
  return undefined;
}

function checkShiftHold(
  layers: ILayer[],
  layerStateFlags: number,
  plainShiftPressed: boolean,
): boolean {
  const shiftLayerHold = layers.some(
    (layer, layerIndex) =>
      isLayerActive(layerStateFlags, layerIndex) &&
      layer.attachedModifiers?.includes('K_Shift'),
  );
  return shiftLayerHold || plainShiftPressed;
}

// ----------------------------------------------------------------------

type ILocalState = {
  profileData: IProfileData;
  displayDesign: IDisplayKeyboardDesign;
  keyStates: { [keyId: string]: boolean };
  layerStateFlags: number;
  holdKeyIndices: number[];
  plainShiftPressed: boolean;
};

const setProfileData = (profile: IProfileData, local: ILocalState) => {
  if (local.profileData !== profile) {
    local.profileData = profile;
    local.displayDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
      profile.keyboardDesign,
    );
  }
};

const handlekeyEvents = (ev: IRealtimeKeyboardEvent, local: ILocalState) => {
  if (ev.type === 'keyStateChanged') {
    const { keyIndex, isDown } = ev;
    if (isDown) {
      addArrayItemIfNotExist(local.holdKeyIndices, keyIndex);
    } else {
      removeArrayItems(local.holdKeyIndices, keyIndex);
    }
    const keyUnitId = translateKeyIndexToKeyUnitId(keyIndex, local.profileData);
    if (keyUnitId) {
      local.keyStates[keyUnitId] = isDown;
      const assign = getDynamicKeyAssign(
        local.profileData,
        local.layerStateFlags,
        keyUnitId,
      );
      if (isAssignShift(assign)) {
        local.plainShiftPressed = isDown;
      }
    }
  } else if (ev.type === 'layerChanged') {
    local.layerStateFlags = ev.layerActiveFlags;
  }
};

// ----------------------------------------------------------------------

function createLocalState(): ILocalState {
  return {
    profileData: fallbackProfileData,
    displayDesign: createFallbackDisplayKeyboardDesign(),
    keyStates: {},
    layerStateFlags: 1,
    holdKeyIndices: [],
    plainShiftPressed: false,
  };
}

export function usePlayerModel(): IPlayerModel {
  const local = Hook.useMemo<ILocalState>(createLocalState, []);
  const {
    keyStates,
    displayDesign,
    profileData,
    layerStateFlags,
    holdKeyIndices,
    plainShiftPressed,
  } = local;
  const { layers } = profileData;
  Hook.useEffect(
    () =>
      ipcAgent.events.device_keyEvents.subscribe((ev) =>
        handlekeyEvents(ev, local),
      ),
    [],
  );
  return {
    holdKeyIndices,
    keyStates,
    layers,
    displayDesign,
    layerStackItems: makeLayerStackItems(layers, layerStateFlags),
    shiftHold: checkShiftHold(layers, layerStateFlags, plainShiftPressed),
    getDynamicKeyAssign: (keyUnitId: string) =>
      getDynamicKeyAssign(profileData, layerStateFlags, keyUnitId),
    setProfileData: (profile: IProfileData) => setProfileData(profile, local),
  };
}
