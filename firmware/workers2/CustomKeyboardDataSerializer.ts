import { IKermiteStandardKeyboaredSpec } from "@/CoreDefinitions";

export function serializeCustomKeyboardSpec(
  spec: IKermiteStandardKeyboaredSpec
): number[] {
  return [spec.pin_ex_led];
}
