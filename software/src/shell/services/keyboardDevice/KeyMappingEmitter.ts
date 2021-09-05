import { delayMs, IProfileData } from '~/shared';
import { IDeviceWrapper } from '~/shell/services/keyboardDevice/DeviceWrapper';
import { Packets } from '~/shell/services/keyboardDevice/Packets';
import { makeProfileBinaryData } from '~/shell/services/keyboardLogic/ProfileDataBinaryPacker';
import { calcChecksum } from './Helpers';

export namespace KeyMappingEmitter {
  export async function emitKeyAssignsToDevice(
    profileData: IProfileData,
    device: IDeviceWrapper | undefined,
  ): Promise<boolean> {
    if (!device) {
      console.log(`device is not connected`);
      return false;
    }
    console.log(emitKeyAssignsToDevice.name);

    const data = makeProfileBinaryData(profileData);
    const checksum = calcChecksum(data);
    const dataLength = data.length;

    if (dataLength >= 1024) {
      throw new Error(`key mapping data too large, ${dataLength / 1024}`);
    }

    console.log(`len: ${dataLength}, checksum: ${checksum}`);

    const keyAssignDataFrames = Packets.makeMemoryWriteOperationFrames(data);
    const checksumRequestFrame = Packets.makeMemoryChecksumRequestFrame(
      0,
      dataLength,
    );

    try {
      console.log('writing...');
      device.writeSingleFrame(Packets.memoryWriteTransactionStartFrame);
      delayMs(50);
      await device.writeFrames(keyAssignDataFrames);

      device.writeSingleFrame(checksumRequestFrame);
      delayMs(50);
      device.writeSingleFrame(Packets.memoryWriteTransactionEndFrame);
      console.log('write done');
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
