import {
  IBootloaderDeviceDetectionStatus,
  IFirmwareOriginEx,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { createEventPort } from '~/shell/funcs';
import {
  firmwareFileLoader_loadFirmwareFile,
  firmwareFileLoader_loadFirmwareFileByPackageInfo,
} from './firmwareFileLoader/firmwareFileLoader';
import { IFirmwareBinaryFileSpec } from './types';

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

  private executeDownloadBlobFile(binarySpec: IFirmwareBinaryFileSpec) {
    const { fileName, fileContentBytes } = binarySpec;
    const blob = new Blob([fileContentBytes.buffer], {
      type: 'application-octet-binary',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
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
      this.executeDownloadBlobFile(binarySpec);
    }
  }

  async downloadFirmwareUf2FileFromPackage(
    packageInfo: IProjectPackageInfo,
    variationId: string,
  ): Promise<void> {
    const binarySpec = await firmwareFileLoader_loadFirmwareFileByPackageInfo(
      packageInfo,
      variationId,
      'online',
    );
    if (binarySpec?.targetDevice === 'rp2040') {
      this.executeDownloadBlobFile(binarySpec);
    }
  }
}
