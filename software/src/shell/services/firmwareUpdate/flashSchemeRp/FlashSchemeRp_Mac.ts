// import drivelist from 'drivelist';
import { fsExistsSync, fsxCopyFile } from '~/shell/funcs';
import { IFirmwareUpdateScheme } from '~/shell/services/firmwareUpdate/types';

export class FirmwareUpdateSchemeRp_Mac implements IFirmwareUpdateScheme {
  resetDeviceDetectionStatus() {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async updateDeviceDetection() {
    // const drives = await drivelist.list();
    // const drive = drives.find((d) => d.description === 'RPI RP2 Media');
    // if (drive?.mountpoints[0]) {
    //   const mountedPath = drive.mountpoints[0].path;
    //   console.log(`drive ${drive.devicePath} found, mounted on ${mountedPath}`);
    //   return mountedPath;
    // }
    // return undefined;

    const targetDrivePath = '/Volumes/RPI-RP2';
    if (fsExistsSync(targetDrivePath)) {
      return targetDrivePath;
    }
    return undefined;
  }

  async flashFirmware(
    detectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string> {
    try {
      const mountedPath = detectedDeviceSig;
      const uf2FilePath = firmwareFilePath;
      await fsxCopyFile(uf2FilePath, `${mountedPath}/firmware.uf2`);
      return 'ok';
    } catch (err) {
      console.log(err);
      return 'failed to copy file';
    }
  }
}
