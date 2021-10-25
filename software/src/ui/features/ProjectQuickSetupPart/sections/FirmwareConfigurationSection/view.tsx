import { FC, jsx } from 'qx';
import { StandardFirmwareEditor } from '~/ui/editors';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/parts/SectionLayoutComponents';

export const FirmwareConfigurationSection: FC = () => (
  <SectionFrame title="Firmware Configuration">
    <StandardFirmwareEditor />
  </SectionFrame>
);
