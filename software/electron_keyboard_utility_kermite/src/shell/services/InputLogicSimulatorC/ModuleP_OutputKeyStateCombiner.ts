import { HidKeyCodes } from '~defs/HidKeyCodes';
import { ModifierVirtualKey } from '~defs/VirtualKeys';
import { IHoldKeyBind, logicSimulatorStateC } from './LogicSimulatorCCommon';
import { ModuleW_HidReportOutputBuffer } from './ModuleW_HidReportOutputBuffer';
import { Arrays } from '~funcs/Arrays';

export namespace ModuleP_OutputKeyStateCombiner {
  function getModifierByte(modFlags: { [vk in ModifierVirtualKey]: boolean }) {
    let modifierByte = 0;
    modFlags.K_Ctrl && (modifierByte |= 0x01);
    modFlags.K_Shift && (modifierByte |= 0x02);
    modFlags.K_Alt && (modifierByte |= 0x04);
    modFlags.K_OS && (modifierByte |= 0x08);
    return modifierByte;
  }

  function reduceHoldKeyBindsToHidReport(holdKeyBinds: IHoldKeyBind[]) {
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

  function updateSlots(slots: number[], holdKeyCodes: number[]) {
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
        const pos = slots.indexOf(0);
        if (pos !== -1) {
          slots[pos] = kc;
        }
      }
    }
  }

  const local = new (class {
    slots: number[] = [0, 0, 0, 0, 0, 0];
  })();

  export function updateOutputReport() {
    const { holdKeyCodes, modifierByte } = reduceHoldKeyBindsToHidReport(
      logicSimulatorStateC.holdKeyBinds
    );
    updateSlots(local.slots, holdKeyCodes);
    const hidReport = [modifierByte, 0, ...local.slots];
    ModuleW_HidReportOutputBuffer.commitHidReport(hidReport);
  }
}
