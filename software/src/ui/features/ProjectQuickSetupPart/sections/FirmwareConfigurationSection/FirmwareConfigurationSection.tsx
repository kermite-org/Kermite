import { FC, jsx, useEffect } from 'qx';
import {
  StandardFirmwareEditor,
  StandardFirmwareEditor_ExposedModel,
} from '~/ui/editors';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/parts/SectionFrame';

function useFirmwareConfigurationSectionModel() {
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

export const FirmwareConfigurationSection: FC = () => {
  useFirmwareConfigurationSectionModel();
  return (
    <SectionFrame title="Firmware Configuration">
      <StandardFirmwareEditor />
    </SectionFrame>
  );
};
