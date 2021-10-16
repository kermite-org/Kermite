import { FC, jsx } from 'qx';
import { StandardFirmwareEditor } from '~/ui/editors';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/parts/SectionFrame';
import { useFirmwareConfigurationSectionModel } from '~/ui/features/ProjectQuickSetupPart/sections/FirmwareConfigurationSection/model';

export const FirmwareConfigurationSection: FC = () => {
  useFirmwareConfigurationSectionModel();
  return (
    <SectionFrame title="Firmware Configuration">
      <StandardFirmwareEditor />
    </SectionFrame>
  );
};
