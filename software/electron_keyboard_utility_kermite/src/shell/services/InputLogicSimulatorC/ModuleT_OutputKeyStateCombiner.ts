import { HidKeyCodes } from '~defs/HidKeyCodes';
import { ModifierVirtualKey } from '~defs/VirtualKeys';
import { IHoldKeySet, createModuleIo } from './LogicSimulatorCCommon';

export namespace ModuleT_OutputKeyStateCombiner {
  function getModifierByte(modFlags: { [vk in ModifierVirtualKey]: boolean }) {
    let modifierByte = 0;
    modFlags.K_Ctrl && (modifierByte |= 0x01);
    modFlags.K_Shift && (modifierByte |= 0x02);
    modFlags.K_Alt && (modifierByte |= 0x04);
    modFlags.K_OS && (modifierByte |= 0x08);
    return modifierByte;
  }

  function reduceHoldKeyBindsToHidReport(holdKeyBinds: IHoldKeySet[]) {
    const modFlags: {
      [vk in ModifierVirtualKey]: boolean;
    } = {
      K_Ctrl: false,
      K_Shift: false,
      K_Alt: false,
      K_OS: false
    };
    const holdKeyCodes: number[] = [];

    for (const hk of holdKeyBinds) {
      const { virtualKey: vk, attachedModifiers: mods } = hk;
      if (vk in modFlags) {
        modFlags[vk as ModifierVirtualKey] = true;
      } else {
        if (mods) {
          mods.forEach((modVk) => {
            modFlags[modVk] = true;
          });
        }
        const hk = HidKeyCodes[vk];
        const withShift = (hk & 0x100) > 0;
        const cancelShift = (hk & 0x200) > 0;
        if (withShift) {
          modFlags.K_Shift = true;
        }
        const hasExModifiers =
          modFlags.K_Ctrl || modFlags.K_Alt || modFlags.K_OS;
        if (!hasExModifiers && cancelShift) {
          modFlags.K_Shift = false;
        }
        holdKeyCodes.push(hk & 0xff);
      }
    }
    const modifierByte = getModifierByte(modFlags);
    return { holdKeyCodes, modifierByte };
  }

  const local = new (class {
    slots: number[] = [0, 0, 0, 0, 0, 0];
    nextSlotIndex: number = 0;
  })();

  function findNextSlotIndex(): number {
    const { slots, nextSlotIndex } = local;
    let idx = nextSlotIndex;
    for (let i = 0; i < slots.length; i++) {
      idx = (idx + 1) % slots.length;
      if (slots[idx] === 0) {
        local.nextSlotIndex = idx;
        return idx;
      }
    }
    local.nextSlotIndex = idx;
    return -1;
  }

  function updateSlots(holdKeyCodes: number[]) {
    const { slots } = local;
    //remove released keys from slots
    for (let i = 0; i < slots.length; i++) {
      const kc = slots[i];
      if (!holdKeyCodes.includes(kc)) {
        slots[i] = 0;
      }
    }

    //add pressed keys to slots
    for (const kc of holdKeyCodes) {
      if (!slots.includes(kc)) {
        // const pos = slots.indexOf(0);  //seek from head
        const idx = findNextSlotIndex(); //round robin
        if (idx !== -1) {
          slots[idx] = kc;
        }
      }
    }
  }

  export const io = createModuleIo<IHoldKeySet[], number[]>(updateOutputReport);

  function updateOutputReport(holdKeySets: IHoldKeySet[]) {
    const { holdKeyCodes, modifierByte } = reduceHoldKeyBindsToHidReport(
      holdKeySets
    );
    updateSlots(holdKeyCodes);
    const hidReport = [modifierByte, 0, ...local.slots];
    io.emit(hidReport);
  }
}
