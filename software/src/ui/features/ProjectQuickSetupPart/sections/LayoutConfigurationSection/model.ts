import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { createLayoutFromFirmwareSpec } from '~/ui/features/ProjectQuickSetupPart/sections/LayoutConfigurationSection/helpers';
import { useMemoEx } from '~/ui/utils';

export function useLayoutConfigurationSectionModel() {
  const { firmwareConfig, layoutOptions } = projectQuickSetupStore.state;
  const design = useMemoEx(createLayoutFromFirmwareSpec, [
    firmwareConfig,
    layoutOptions,
  ]);
  return { design };
}
