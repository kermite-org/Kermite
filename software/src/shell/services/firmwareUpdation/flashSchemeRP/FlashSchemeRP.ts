// import drivelist from 'drivelist';
import { fsExistsSync, fsxCopyFile } from '~/shell/funcs';
import { IFirmwareUpdationScheme } from '~/shell/services/firmwareUpdation/interfaces';

export class FirmwareUpdationSchemeRP implements IFirmwareUpdationScheme {
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
    dectectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string> {
    try {
      const mountedPath = dectectedDeviceSig;
      const uf2FilePath = firmwareFilePath;
      await fsxCopyFile(uf2FilePath, `${mountedPath}/firmware.uf2`);
      return 'ok';
    } catch (err) {
      console.log(err);
      return 'failed to copy file';
    }
  }
}
