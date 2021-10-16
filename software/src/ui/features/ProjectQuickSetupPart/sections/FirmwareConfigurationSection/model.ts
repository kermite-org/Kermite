import { useEffect } from 'qx';
import { StandardFirmwareEditor_ExposedModel } from '~/ui/editors';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';

export function useFirmwareConfigurationSectionModel() {
  const { editValues, canSave, loadFirmwareConfig } =
    StandardFirmwareEditor_ExposedModel;
  useEffect(() => {
    loadFirmwareConfig(projectQuickSetupStore.state.firmwareConfig, true);
  }, []);
  useEffect(() => {
    projectQuickSetupStore.actions.writeFirmwareConfig(
      canSave ? editValues : undefined,
    );
  }, [editValues, canSave]);
}
