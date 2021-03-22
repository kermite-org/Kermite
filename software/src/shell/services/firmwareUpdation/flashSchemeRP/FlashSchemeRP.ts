import drivelist from 'drivelist';
import { fsxCopyFile } from '~/shell/funcs';
import { IFirmwareUpdationScheme } from '~/shell/services/firmwareUpdation/interfaces';

export class FirmwareUpdationSchemeRP implements IFirmwareUpdationScheme {
  resetDeviceDetectionStatus() {}

  async updateDeviceDetection() {
    const drives = await drivelist.list();
    const drive = drives.find((d) => d.description === 'RPI RP2 Media');
    if (drive?.mountpoints[0]) {
      const mountedPath = drive.mountpoints[0].path;
      console.log(`drive ${drive.devicePath} found, mounted on ${mountedPath}`);
      return mountedPath;
    }
    return undefined;
  }

  async flashFirmware(
    dectectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string> {
    try {
      const mountedPath = dectectedDeviceSig;
      const uf2FilePath = firmwareFilePath;
      await fsxCopyFile(uf2FilePath, `${mountedPath}/firmware.uf2`);
      return 'ok';
    } catch (errr) {
      return 'failed to copy file';
    }
  }
}
