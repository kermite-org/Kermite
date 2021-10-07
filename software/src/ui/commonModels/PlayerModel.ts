import { useEffect, useLocal } from 'qx';
import {
  addArrayItemIfNotExist,
  createFallbackDisplayKeyboardDesign,
  fallbackProfileData,
  IAssignEntry,
  IAssignOperation,
  IAssignOperationKeyInput,
  IDisplayKeyboardDesign,
  ILayer,
  IProfileData,
  IRealtimeKeyboardEvent,
  removeArrayItems,
  routerConstants,
  VirtualKey,
  DisplayKeyboardDesignLoader,
} from '~/shared';
import { ipcAgent } from '~/ui/base';
import { ILayerStackItem, IPlayerModel } from '~/ui/commonModels/Interfaces';
import { useRoutingChannelModel } from '~/ui/commonModels/ParameterBasedModeModels';

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

const {
  RoutingChannelValueAny,
  ModifierSourceValueAny,
  ModifierDestinationValueKeep,
} = routerConstants;
const VirtualKeySourceValueAny: VirtualKey = 'K_RoutingSource_Any';
const VirtualKeyDestinationValueKeep: VirtualKey = 'K_RoutingDestination_Keep';

function translateKeyInputOperation(
  op: IAssignOperationKeyInput,
  profile: IProfileData,
  routingChannel: number,
): IAssignOperationKeyInput {
  let virtualKey = op.virtualKey;
  let modifiers = op.attachedModifiers;

  for (const re of profile.mappingEntries) {
    const ch = re.channelIndex;
    if (ch === routingChannel || ch === RoutingChannelValueAny) {
      const srcVirtualKey = re.srcKey;
      const srcModifiers = re.srcModifiers;
      if (
        (virtualKey === srcVirtualKey ||
          srcVirtualKey === VirtualKeySourceValueAny) &&
        (modifiers === srcModifiers || srcModifiers === ModifierSourceValueAny)
      ) {
        const dstVirtualKey = re.dstKey;
        const dstModifiers = re.dstModifiers;
        if (dstVirtualKey !== VirtualKeyDestinationValueKeep) {
          virtualKey = dstVirtualKey;
        }
        if (dstModifiers !== ModifierDestinationValueKeep) {
          modifiers = dstModifiers;
        }
        return {
          ...op,
          virtualKey,
          attachedModifiers: modifiers,
        };
      }
    }
  }
  return op;
}

function applyOperationRouting(
  op: IAssignOperation | undefined,
  profile: IProfileData,
  routingChannel: number,
): IAssignOperation | undefined {
  if (op?.type === 'keyInput') {
    return translateKeyInputOperation(op, profile, routingChannel);
  }
  return op;
}

function applyAssignRouting(
  assign: IAssignEntry,
  profile: IProfileData,
  routingChannel: number,
): IAssignEntry {
  if (assign.type === 'single') {
    return {
      ...assign,
      op: applyOperationRouting(assign.op, profile, routingChannel),
    };
  } else if (assign.type === 'dual') {
    return {
      ...assign,
      primaryOp: applyOperationRouting(
        assign.primaryOp,
        profile,
        routingChannel,
      ),
      secondaryOp: applyOperationRouting(
        assign.secondaryOp,
        profile,
        routingChannel,
      ),
      tertiaryOp: applyOperationRouting(
        assign.tertiaryOp,
        profile,
        routingChannel,
      ),
    };
  }
  return assign;
}

function getDynamicKeyAssign(
  profileData: IProfileData,
  layerStateFlags: number,
  keyUnitId: string,
  routingChannel: number,
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
        return applyAssignRouting(assign, profileData, routingChannel);
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
      (layer.attachedModifiers & 0b0010) > 0,
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
  routingChannel: number;
};

const setProfileData = (profile: IProfileData, local: ILocalState) => {
  if (local.profileData !== profile) {
    local.profileData = profile;
    local.displayDesign = DisplayKeyboardDesignLoader.loadDisplayKeyboardDesign(
      profile.keyboardDesign,
    );
  }
};

const handleKeyEvents = (ev: IRealtimeKeyboardEvent, local: ILocalState) => {
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
        local.routingChannel,
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
    routingChannel: 0,
  };
}

export function usePlayerModel(): IPlayerModel {
  const local = useLocal<ILocalState>(createLocalState);
  useEffect(
    () =>
      ipcAgent.events.device_keyEvents.subscribe((ev) =>
        handleKeyEvents(ev, local),
      ),
    [],
  );
  const { routingChannel } = useRoutingChannelModel();
  local.routingChannel = routingChannel;
  const {
    keyStates,
    displayDesign,
    profileData,
    layerStateFlags,
    holdKeyIndices,
    plainShiftPressed,
  } = local;
  const { layers, settings } = profileData;
  return {
    holdKeyIndices,
    keyStates,
    layers,
    profileSettings: settings,
    displayDesign,
    layerStackItems: makeLayerStackItems(layers, layerStateFlags),
    shiftHold: checkShiftHold(layers, layerStateFlags, plainShiftPressed),
    getDynamicKeyAssign: (keyUnitId: string) =>
      getDynamicKeyAssign(
        profileData,
        layerStateFlags,
        keyUnitId,
        routingChannel,
      ),
    setProfileData: (profile: IProfileData) => setProfileData(profile, local),
  };
}
