import React from 'react';
import { IKeyAssignsSet, ILayer, IKeyAssignEntry } from '~contract/data';
import {
  getAssignSlotAddress,
  checkIfLognNameKeyAssign
} from '~ui/state/editor';

import { VirtualKeyTexts } from '../../Constants';
import { IKeyboardShape } from '~ui/view/WidgetSite/KeyboardShapes';

function getAssignText(
  assign: IKeyAssignEntry | undefined,
  layers: ILayer[]
): string {
  if (assign) {
    if (assign.type === 'keyInput' && assign.virtualKey !== 'K_NONE') {
      return VirtualKeyTexts[assign.virtualKey] || '';
    }
    if (assign.type === 'holdLayer') {
      const layer = layers.find(la => la.layerId === assign.targetLayerId);
      return (layer && layer.layerName) || '';
    }
    if (assign.type === 'holdModifier') {
      return VirtualKeyTexts[assign.modifierKey] || '';
    }
  }
  return '';
}

interface IAssignViewModel {
  isSelected: boolean;
  assignText: string;
  isExtendedAssign: boolean;
}
export interface IKeyUnitCardViewModel {
  keyUnitId: string;
  pos: { x: number; y: number; r: number };
  isPressed: boolean;
  primaryAssign: IAssignViewModel;
  secondaryAssign: IAssignViewModel;
  selectionHandler(): void;
}

function createAssignViewModel(
  keyUnitId: string,
  isPrimary: boolean,
  keyAssigns: IKeyAssignsSet,
  layers: ILayer[],
  currentSlotAddress: string,
  currentLayerId: string
): IAssignViewModel {
  const slotAddress = getAssignSlotAddress(
    keyUnitId,
    currentLayerId,
    isPrimary
  );
  const isSelected = currentSlotAddress === slotAddress;

  const assign = keyAssigns[slotAddress] || undefined;
  const assignText = getAssignText(assign, layers);
  const isExtendedAssign = checkIfLognNameKeyAssign(assignText);
  return {
    isSelected,
    assignText,
    isExtendedAssign
  };
}

export function useKeyUnitCardViewModels(props: {
  keyAssigns: IKeyAssignsSet;
  layers: ILayer[];
  currentLayerId: string;
  currentSlotAddress: string;
  pressedKeyFlags: {
    [keyId: string]: boolean;
  };
  selectAssignSlot(keyUnitId: string, isPrimary: boolean): void;
  keyboardShape: IKeyboardShape;
}): IKeyUnitCardViewModel[] {
  const {
    keyAssigns,
    layers,
    currentLayerId,
    currentSlotAddress,
    pressedKeyFlags,
    selectAssignSlot,
    keyboardShape
  } = props;

  return React.useMemo(
    () =>
      keyboardShape.keyPositions.map(ku => {
        const { id: keyUnitId, x, y, r } = ku;
        const isPressed = pressedKeyFlags[ku.id];

        const primaryAssign = createAssignViewModel(
          keyUnitId,
          true,
          keyAssigns,
          layers,
          currentSlotAddress,
          currentLayerId
        );

        const secondaryAssign = createAssignViewModel(
          keyUnitId,
          false,
          keyAssigns,
          layers,
          currentSlotAddress,
          currentLayerId
        );

        const selectionHandler = () => selectAssignSlot(ku.id, true);
        return {
          keyUnitId,
          pos: { x, y, r },
          isPressed,
          primaryAssign,
          secondaryAssign,
          selectionHandler
        };
      }),
    [keyAssigns, layers, currentLayerId, currentSlotAddress, pressedKeyFlags]
  );
}
