import {
  makeMemoryChecksumRequestFrame,
  makeMemoryWriteOperationFrames,
  memoryWriteTransactionStartFrame,
  memoryWriteTransactionEndFrame
} from './MemoryOperationFrameBuilder';
import { calcChecksum } from './Helpers';
import { IProfileData } from '~defs/ProfileData';
import { appGlobal } from '../appGlobal';
import { writeUint16LE, writeUint8 } from './Helpers';
import { converProfileDataToBlobBytes } from '../InputLogicSimulatorD/ProfileDataBinaryPacker';
import { delayMs } from '~funcs/Utils';
import { IKeyboardLanguage } from '~defs/ConfigTypes';

/*
Data format for the keymapping data stored in AVR's EEPROM
EEPROM 1KB
[0-23] header 24bytes
[24-1023] keymapping data, 1000bytes

Header 24bytes
[0-1] 0xFE03(LE), magic number
[2-3] 0xFFFF(LE), reserved
[4] logic model type
  0x01 for dominant
[5] format revision, increment when format changed
[6] assign data start location, 24
[7] numKeys
[8] numLayers
[9-23]: padding
*/

export namespace KeyMappingEmitter {
  export interface ILowLevelKeyAssignsDataSet {
    keyNum: number;
    layerNum: number;
    assignsDataBytes: number[];
  }

  function encodeHeaderBytes(numKeys: number, numLayers: number): number[] {
    const headerLength = 24;
    const buffer = Array(headerLength).fill(0);
    writeUint16LE(buffer, 0, 0xfe03);
    writeUint16LE(buffer, 2, 0xffff);
    writeUint8(buffer, 4, 0x01);
    writeUint8(buffer, 5, 0x01);
    writeUint8(buffer, 6, headerLength);
    writeUint8(buffer, 7, numKeys);
    writeUint8(buffer, 8, numLayers);
    return buffer;
  }

  //KeyAssignsDataSet --> data byte array
  export function makeKeyAssignsTransmitData(
    data: ILowLevelKeyAssignsDataSet
  ): number[] {
    const headerBytes = encodeHeaderBytes(data.keyNum, data.layerNum);
    const bodyBytes = data.assignsDataBytes;
    return [...headerBytes, ...bodyBytes];
  }

  function createLowLevelKeyAssignsDataSet(
    profileData: IProfileData,
    lang: IKeyboardLanguage
  ): ILowLevelKeyAssignsDataSet {
    return {
      keyNum: profileData.keyboardShape.keyUnits.length,
      layerNum: profileData.layers.length,
      assignsDataBytes: converProfileDataToBlobBytes(profileData, lang)
    };
  }

  export function emitKeyAssignsToDevice(
    editModel: IProfileData,
    lang: IKeyboardLanguage
  ) {
    const ds = appGlobal.deviceService;

    if (!ds.isOpen) {
      console.log(`device is not connected`);
      return;
    }
    console.log(emitKeyAssignsToDevice.name);

    const data = makeKeyAssignsTransmitData(
      createLowLevelKeyAssignsDataSet(editModel, lang)
    );
    const checksum = calcChecksum(data);
    const dataLength = data.length;

    if (dataLength >= 1024) {
      throw new Error(`key mapping data too large, ${dataLength / 1024}`);
    }

    console.log(`len: ${dataLength}, checksum: ${checksum}`);

    const keyAssingnDataFrames = makeMemoryWriteOperationFrames(
      data,
      'keyMapping'
    );
    const checksumRequestFrame = makeMemoryChecksumRequestFrame(
      'keyMapping',
      0,
      dataLength
    );

    (async () => {
      try {
        console.log('writing...');
        await ds.writeSingleFrame(memoryWriteTransactionStartFrame);
        delayMs(50);
        await ds.writeFrames(keyAssingnDataFrames);

        ds.writeSingleFrame(checksumRequestFrame);
        delayMs(50);
        await ds.writeSingleFrame(memoryWriteTransactionEndFrame);
        console.log('write done');
      } catch (err) {
        console.log(err);
      }
    })();
  }
}
