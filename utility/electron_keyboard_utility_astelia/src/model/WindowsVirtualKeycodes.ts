import { VirtualKey } from './HighLevelDefs';

const enum WVK {
  VK_A = 0x41,
  VK_B,
  VK_C,
  VK_D,
  VK_E,
  VK_F,
  VK_G,
  VK_H,
  VK_I,
  VK_J,
  VK_K,
  VK_L,
  VK_M,
  VK_N,
  VK_O,
  VK_P
}

export const VirtualKeyToWindowsVirtualKeyCodeTable: {
  [vk in VirtualKey]?: number;
} = {
  K_A: WVK.VK_A,
  K_B: WVK.VK_B,
  K_C: WVK.VK_C,
  K_D: WVK.VK_D,
  K_E: WVK.VK_E,
  K_F: WVK.VK_F,
  K_G: WVK.VK_G,
  K_H: WVK.VK_H,
  K_I: WVK.VK_I,
  K_J: WVK.VK_J,
  K_K: WVK.VK_K,
  K_L: WVK.VK_L,
  K_M: WVK.VK_M,
  K_N: WVK.VK_N,
  K_O: WVK.VK_O,
  K_P: WVK.VK_P
};
