// const state = new (class {})();

import { FC, jsx, useEffect } from 'qx';
import { fallbackStandardKeyboardSpec } from '~/shared';
import {
  StandardFirmwareEditor,
  StandardFirmwareEditor_OutputPropsSupplier,
} from '~/ui/editors';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';

function useProjectQuickSetupPartModel() {
  const { editValues, canSave } = StandardFirmwareEditor_OutputPropsSupplier;
  useEffect(() => {
    projectQuickSetupStore.actions.writeFirmwareConfig(
      canSave ? editValues : undefined,
    );
  }, [editValues, canSave]);
}

export const FirmwareConfigurationSection: FC = () => {
  useProjectQuickSetupPartModel();
  return (
    <SectionFrame title="Firmware Configuration">
      <StandardFirmwareEditor
        firmwareConfig={fallbackStandardKeyboardSpec}
        isNewConfig={true}
      />
    </SectionFrame>
  );
};
