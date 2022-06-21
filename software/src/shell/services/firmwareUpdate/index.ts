import {
  IBootloaderDeviceDetectionStatus,
  IFirmwareOriginEx,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { createEventPort } from '~/shell/funcs';
import { firmwareFileLoader_loadFirmwareFile } from './firmwareFileLoader/FirmwareFileLoader';

export class FirmwareUpdateService {
  deviceDetectionEvents = createEventPort<IBootloaderDeviceDetectionStatus>({});

  writeFirmware(
    origin: IResourceOrigin,
    projectId: string,
    variationId: string,
    firmwareOrigin: IFirmwareOriginEx,
  ): 'ok' | string {
    throw new Error('obsolete function invoked');
  }

  writeStandardFirmwareDirect(
    packageInfo: IProjectPackageInfo,
    variationId: string,
  ): 'ok' | string {
    throw new Error('obsolete function invoked');
  }

  async downloadFirmwareUf2File(
    origin: IResourceOrigin,
    projectId: string,
    variationId: string,
    firmwareOrigin: IFirmwareOriginEx,
  ): Promise<void> {
    const binarySpec = await firmwareFileLoader_loadFirmwareFile(
      origin,
      projectId,
      variationId,
      firmwareOrigin,
    );
    if (binarySpec?.targetDevice === 'rp2040') {
      const { fileName, fileContentBytes } = binarySpec;
      const blob = new Blob([fileContentBytes.buffer], {
        type: 'application-octet-binary',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    }
  }
}
