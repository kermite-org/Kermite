import { useEffect, useLocal } from 'alumina';
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
import { ILayerStackItem, IPlayerModel } from '~/ui/commonModels/interfaces';
import {
  useRoutingChannelModel,
  useSystemLayoutModel,
} from '~/ui/commonModels/parameterBasedModeModels';

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

type IVirtualKeyShiftTable = { [vk in VirtualKey]?: VirtualKey };

function applyAssignOperationShift(
  op: IAssignOperationKeyInput,
  profile: IProfileData,
  shiftHold: boolean,
  virtualKeyShiftTable: IVirtualKeyShiftTable,
  layerIndex: number,
): IAssignOperationKeyInput {
  if (profile.settings.shiftCancelMode === 'all') {
    return op;
  }
  const layer = profile.layers[layerIndex];
  const isShiftLayer = (layer.attachedModifiers & 0b0010) > 0;
  if (profile.settings.shiftCancelMode === 'shiftLayer' && isShiftLayer) {
    return op;
  }
  if (shiftHold) {
    const modVirtualKey = virtualKeyShiftTable[op.virtualKey];
    if (modVirtualKey) {
      return {
        ...op,
        virtualKey: modVirtualKey,
      };
    }
  }
  return op;
}

function applyOperationRouting(
  op: IAssignOperation | undefined,
  profile: IProfileData,
  routingChannel: number,
  shiftHold: boolean,
  virtualKeyShiftTable: IVirtualKeyShiftTable,
  layerIndex: number,
): IAssignOperation | undefined {
  if (op?.type === 'keyInput') {
    const op2 = applyAssignOperationShift(
      op,
      profile,
      shiftHold,
      virtualKeyShiftTable,
      layerIndex,
    );
    return translateKeyInputOperation(op2, profile, routingChannel);
  }
  return op;
}

function applyAssignRouting(
  assign: IAssignEntry,
  profile: IProfileData,
  routingChannel: number,
  shiftHold: boolean,
  virtualKeyShiftTable: IVirtualKeyShiftTable,
  layerIndex: number,
): IAssignEntry {
  if (assign.type === 'single') {
    return {
      ...assign,
      op: applyOperationRouting(
        assign.op,
        profile,
        routingChannel,
        shiftHold,
        virtualKeyShiftTable,
        layerIndex,
      ),
    };
  } else if (assign.type === 'dual') {
    return {
      ...assign,
      primaryOp: applyOperationRouting(
        assign.primaryOp,
        profile,
        routingChannel,
        shiftHold,
        virtualKeyShiftTable,
        layerIndex,
      ),
      secondaryOp: applyOperationRouting(
        assign.secondaryOp,
        profile,
        routingChannel,
        shiftHold,
        virtualKeyShiftTable,
        layerIndex,
      ),
      tertiaryOp: applyOperationRouting(
        assign.tertiaryOp,
        profile,
        routingChannel,
        shiftHold,
        virtualKeyShiftTable,
        layerIndex,
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
  shiftHold: boolean,
  virtualKeyShiftTable: IVirtualKeyShiftTable,
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
        return applyAssignRouting(
          assign,
          profileData,
          routingChannel,
          shiftHold,
          virtualKeyShiftTable,
          i,
        );
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
        false,
        {},
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

const virtualKeyShiftTableUs: { [vk in VirtualKey]?: VirtualKey } = {
  K_Num_1: 'K_Exclamation',
  K_Num_2: 'K_AtMark',
  K_Num_3: 'K_Sharp',
  K_Num_4: 'K_Dollar',
  K_Num_5: 'K_Percent',
  K_Num_6: 'K_Hat',
  K_Num_7: 'K_Ampersand',
  K_Num_8: 'K_Asterisk',
  K_Num_9: 'K_LeftParenthesis',
  K_Num_0: 'K_RightParenthesis',
  K_Minus: 'K_Underscore',
  K_Equal: 'K_Plus',
  K_LeftSquareBracket: 'K_LeftCurlyBrace',
  K_RightSquareBracket: 'K_RightCurlyBrace',
  K_BackSlash: 'K_VerticalBar',
  K_Semicolon: 'K_Colon',
  K_SingleQuote: 'K_DoubleQuote',
  K_Comma: 'K_LessThan',
  K_Dot: 'K_GreaterThan',
  K_Slash: 'K_Question',
};

const virtualKeyShiftTableJis: { [vk in VirtualKey]?: VirtualKey } = {
  K_Num_1: 'K_Exclamation',
  K_Num_2: 'K_DoubleQuote',
  K_Num_3: 'K_Sharp',
  K_Num_4: 'K_Dollar',
  K_Num_5: 'K_Percent',
  K_Num_6: 'K_Ampersand',
  K_Num_7: 'K_SingleQuote',
  K_Num_8: 'K_LeftParenthesis',
  K_Num_9: 'K_RightParenthesis',
  K_Minus: 'K_Equal',
  K_Hat: 'K_Tilde',
  K_Yen: 'K_VerticalBar',
  K_AtMark: 'K_BackQuote',
  K_LeftSquareBracket: 'K_LeftCurlyBrace',
  K_Semicolon: 'K_Plus',
  K_Colon: 'K_Asterisk',
  K_RightSquareBracket: 'K_RightCurlyBrace',
  K_Comma: 'K_LessThan',
  K_Dot: 'K_GreaterThan',
  K_Slash: 'K_Question',
  K_BackSlash: 'K_Underscore',
};

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
  const { systemLayoutIndex } = useSystemLayoutModel();
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
  const shiftHold = checkShiftHold(layers, layerStateFlags, plainShiftPressed);
  const virtualKeyShiftTable =
    systemLayoutIndex === 0 ? virtualKeyShiftTableUs : virtualKeyShiftTableJis;

  return {
    holdKeyIndices,
    keyStates,
    layers,
    profileSettings: settings,
    displayDesign,
    layerStackItems: makeLayerStackItems(layers, layerStateFlags),
    shiftHold,
    getDynamicKeyAssign: (keyUnitId: string) =>
      getDynamicKeyAssign(
        profileData,
        layerStateFlags,
        keyUnitId,
        routingChannel,
        shiftHold,
        virtualKeyShiftTable,
      ),
    setProfileData: (profile: IProfileData) => setProfileData(profile, local),
  };
}
