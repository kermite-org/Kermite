import { createDictionaryFromKeyValues } from '~/shared';
import { executeShellCommandAsync, fsxCopyFile } from '~/shell/funcs';
import { IFirmwareUpdationScheme } from '~/shell/services/firmwareUpdation/Interfaces';

async function findMountedDriveByVolumeName(
  volumeName: string,
): Promise<string | undefined> {
  const commandResultText = await executeShellCommandAsync(
    'wmic logicaldisk get name,volumename',
  );
  const lines = commandResultText
    .trim()
    .split(/\r?\r\n/)
    .slice(1);
  const dict = createDictionaryFromKeyValues(
    lines.map((line) => {
      const [driveLetter, volumeName] = line.split(':');
      return [volumeName.trim(), driveLetter];
    }),
  );
  return dict[volumeName];
}

export class FirmwareUpdationSchemeRp_Windows
  implements IFirmwareUpdationScheme {
  resetDeviceDetectionStatus() {}

  async updateDeviceDetection() {
    const targetVolumeName = 'RPI-RP2';
    const driveLetter = await findMountedDriveByVolumeName(targetVolumeName);
    if (driveLetter) {
      return `${targetVolumeName}(${driveLetter}:)`;
    }
    return undefined;
  }

  async flashFirmware(
    dectectedDeviceSig: string,
    firmwareFilePath: string,
  ): Promise<'ok' | string> {
    try {
      const driveLetter = dectectedDeviceSig.match(/\(([A-Z]):\)/)?.[1];
      if (!driveLetter) {
        throw new Error(
          `cannot extract driveLetter from ${dectectedDeviceSig}`,
        );
      }
      const uf2FilePath = firmwareFilePath;
      await fsxCopyFile(uf2FilePath, `${driveLetter}:/firmware.uf2`);
      return 'ok';
    } catch (err) {
      console.log(err);
      return 'failed to copy file';
    }
  }
}
