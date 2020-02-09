import React from 'react';
import { IKeyAssignsSet, ILayer, IKeyAssignEntry } from '~contract/data';
import {
  getAssignSlotAddress,
  checkIfLognNameKeyAssign
} from '~ui/state/editor';
import { KeyboardShape } from '~ui/view/WidgetSite/KeyboardShape';
import { IKeyUnitCardViewModel } from './Types';
import { VirtualKeyTexts } from '../../Constants';

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
  }
  return '';
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
}): IKeyUnitCardViewModel[] {
  const {
    keyAssigns,
    layers,
    currentLayerId,
    currentSlotAddress,
    pressedKeyFlags,
    selectAssignSlot
  } = props;

  return React.useMemo(
    () =>
      KeyboardShape.keyPositions.map(ku => {
        const { id: keyUnitId, x, y, r } = ku;
        const primarySlotAddress = getAssignSlotAddress(
          ku.id,
          currentLayerId,
          true
        );
        const isPressed = pressedKeyFlags[ku.id];
        const isSelected = primarySlotAddress === currentSlotAddress;
        const assign = keyAssigns[primarySlotAddress] || undefined;
        const assignText = getAssignText(assign, layers);
        const isExtendedAssign = checkIfLognNameKeyAssign(assignText);
        const selectionHandler = () => selectAssignSlot(ku.id, true);
        return {
          keyUnitId,
          pos: { x, y, r },
          isSelected,
          isPressed,
          assignText,
          selectionHandler,
          isExtendedAssign
        };
      }),
    [keyAssigns, layers, currentLayerId, currentSlotAddress, pressedKeyFlags]
  );
}
