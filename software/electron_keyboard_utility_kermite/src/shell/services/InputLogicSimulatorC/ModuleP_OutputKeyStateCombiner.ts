import { HidKeyCodes } from '~defs/HidKeyCodes';
import { ModifierVirtualKey, VirtualKey } from '~defs/VirtualKeys';
import { Arrays } from '~funcs/Arrays';
import { ModuleW_HidReportOutputBuffer } from './ModuleW_HidReportOutputBuffer';

export namespace ModuleP_OutputKeyStateCombiner {
  function getModifierBits(modFlags: { [vk in ModifierVirtualKey]: boolean }) {
    let modifierBits = 0;
    modFlags.K_Ctrl && (modifierBits |= 0x01);
    modFlags.K_Shift && (modifierBits |= 0x02);
    modFlags.K_Alt && (modifierBits |= 0x04);
    modFlags.K_OS && (modifierBits |= 0x08);
    return modifierBits;
  }

  function reduceHoldKeyBindsToHidReport(
    holdKeyBinds: HoldKeyBind[]
  ): number[] {
    const modFlags: {
      [vk in ModifierVirtualKey]: boolean;
    } = {
      K_Ctrl: false,
      K_Shift: false,
      K_Alt: false,
      K_OS: false
    };
    const hidKeyCodes: number[] = [];

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
        hidKeyCodes.push(hk & 0xff);
      }
    }

    const modifierBits = getModifierBits(modFlags);
    return [modifierBits, 0, ...[...hidKeyCodes, 0, 0, 0, 0, 0, 0].slice(0, 6)];
  }

  interface HoldKeyBind {
    keyId: string;
    virtualKey: VirtualKey;
    attachedModifiers: ModifierVirtualKey[];
  }

  const local = new (class {
    holdKeyBinds: HoldKeyBind[] = [];
  })();

  export function pushHoldKeyBind(
    keyId: string,
    virtualKey: VirtualKey,
    attachedModifiers: ModifierVirtualKey[]
  ) {
    local.holdKeyBinds.push({ keyId, virtualKey, attachedModifiers });
  }

  export function removeHoldKeyBind(keyId: string) {
    Arrays.removeIf(local.holdKeyBinds, (hk) => hk.keyId === keyId);
  }

  export function updateOutputReport() {
    const hidReport = reduceHoldKeyBindsToHidReport(local.holdKeyBinds);
    ModuleW_HidReportOutputBuffer.commitHidReport(hidReport);
  }
}
