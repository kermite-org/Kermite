import { FC, jsx } from 'qx';
import { StandardFirmwareEditor } from '~/ui/editors';
import { SectionFrame } from '~/ui/features/ProjectQuickSetupPart/parts/SectionFrame';

export const FirmwareConfigurationSection: FC = () => (
  <SectionFrame title="Firmware Configuration">
    <StandardFirmwareEditor />
  </SectionFrame>
);
