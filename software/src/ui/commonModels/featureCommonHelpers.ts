import {
  IProjectPackageInfo,
  IFirmwareTargetDevice,
  getFirmwareTargetDeviceFromBaseFirmwareType,
} from '~/shared';
import { uiReaders } from '~/ui/store';

export function getFirmwareTargetDeviceType(
  projectInfo: IProjectPackageInfo,
  variationId: string,
): IFirmwareTargetDevice | undefined {
  const firmwareEntry = projectInfo.firmwares.find(
    (it) => it.variationId === variationId,
  );
  if (firmwareEntry) {
    if (firmwareEntry.type === 'standard') {
      return getFirmwareTargetDeviceFromBaseFirmwareType(
        firmwareEntry.standardFirmwareConfig.baseFirmwareType,
      );
    } else {
      const customFirmwareInfo = uiReaders.allCustomFirmwareInfos.find(
        (it) => it.firmwareId === firmwareEntry.customFirmwareId,
      );
      return customFirmwareInfo?.targetDevice;
    }
  }
}
