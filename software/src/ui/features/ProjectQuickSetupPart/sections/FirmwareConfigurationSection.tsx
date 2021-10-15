// const state = new (class {})();

import { FC, jsx, useEffect } from 'qx';
import { fallbackStandardKeyboardSpec } from '~/shared';
import {
  StandardFirmwareEditor,
  StandardFirmwareEditor_ExposedModel,
} from '~/ui/editors';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';

function useFirmwareConfigurationSectionModel() {
  const { editValues, canSave, loadFirmwareConfig } =
    StandardFirmwareEditor_ExposedModel;
  useEffect(() => {
    loadFirmwareConfig(fallbackStandardKeyboardSpec, true);
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
