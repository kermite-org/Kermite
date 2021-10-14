// const state = new (class {})();

import { jsx, useEffect } from 'qx';
import { fallbackStandardKeyboardSpec } from '~/shared';
import { FcWithClassName } from '~/ui/base';
import {
  StandardFirmwareEditor,
  StandardFirmwareEditor_OutputPropsSupplier,
} from '~/ui/editors';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/SectionFrame';
import { projectQuickSetupStore } from '~/ui/features/ProjectQuickSetupPart/base/ProjectQuickSetupStore';

function useProjectQuickSetupPartModel() {
  const { editValues, canSave } = StandardFirmwareEditor_OutputPropsSupplier;
  useEffect(() => {
    if (canSave) {
      projectQuickSetupStore.actions.writeFirmwareConfig(canSave && editValues);
    }
  }, [editValues, canSave]);
}

export const FirmwareConfigurationSection: FcWithClassName = ({
  className,
}) => {
  useProjectQuickSetupPartModel();
  return (
    <SectionFrame title="Firmware Configuration" class={className}>
      <StandardFirmwareEditor
        firmwareConfig={fallbackStandardKeyboardSpec}
        isNewConfig={true}
      />
    </SectionFrame>
  );
};
