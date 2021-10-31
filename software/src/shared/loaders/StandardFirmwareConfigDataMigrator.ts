import { IStandardFirmwareConfig } from '~/shared';

export type IStandardFirmwareConfigOld = IStandardFirmwareConfig & {
  useBoardLedsProMicroAvr?: boolean;
  useBoardLedsProMicroRp?: boolean;
  useBoardLedsRpiPico?: boolean;
};

export function migrateStandardFirmwareConfig(
  spec: IStandardFirmwareConfigOld,
) {
  if (spec.useBoardLedsProMicroAvr) {
    delete spec.useBoardLedsProMicroAvr;
    spec.boardType = 'ProMicro';
    spec.useBoardLeds = true;
  }
  if (spec.useBoardLedsProMicroRp) {
    delete spec.useBoardLedsProMicroRp;
    spec.boardType = 'ProMicroRP2040';
    spec.useBoardLeds = true;
  }
  if (spec.useBoardLedsRpiPico) {
    delete spec.useBoardLedsRpiPico;
    spec.boardType = 'RpiPico';
    spec.useBoardLeds = true;
  }
}
