import {
  IBootloaderDeviceDetectionStatus,
  IFirmwareOriginEx,
  IProjectPackageInfo,
  IResourceOrigin,
} from '~/shared';
import { createEventPort } from '~/shell/funcs';

export class FirmwareUpdateService {
  deviceDetectionEvents = createEventPort<IBootloaderDeviceDetectionStatus>({});

  async writeFirmware(
    origin: IResourceOrigin,
    projectId: string,
    variationId: string,
    firmwareOrigin: IFirmwareOriginEx,
  ): Promise<'ok' | string> {
    throw new Error('obsolete function invoked');
  }

  async writeStandardFirmwareDirect(
    packageInfo: IProjectPackageInfo,
    variationId: string,
  ): Promise<'ok' | string> {
    throw new Error('obsolete function invoked');
  }
}
