import {
  IBootloaderDeviceDetectionStatus,
  IFirmwareOriginEx,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { createEventPort } from '~/shell/funcs';

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
}
