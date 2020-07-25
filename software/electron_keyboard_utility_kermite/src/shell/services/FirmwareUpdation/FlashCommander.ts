import SerialPort = require('serialport');

import { readHexFileBytesBlocks } from './HexFileReader';
import { bytesToHexString, bhi, blo } from './helpers';

export namespace FlashCommander {
  class SerialPortBridge {
    port: SerialPort;

    constructor(comPortName: string) {
      this.port = new SerialPort(comPortName);
    }

    close() {
      this.port.close();
    }

    query(op: string, ...args: number[]): Promise<number[]> {
      if (args.length > 0) {
        console.log(`>${op} ${bytesToHexString(args)}`);
      } else {
        console.log(`>${op}`);
      }
      const command = [op.charCodeAt(0), ...args];
      // console.log(command)
      return new Promise((resolve) => {
        this.port.once('data', (data) => {
          // console.log({data})
          const ar = new Uint8Array(data);
          const ar1 = [...ar];
          console.log(bytesToHexString(ar1));
          resolve(ar1);
        });
        this.port.write(command);
      });
    }

    queryEx(
      op: string,
      args: number[],
      lengthToRead: number
    ): Promise<number[]> {
      if (args.length > 0) {
        console.log(`>${op} ${bytesToHexString(args)}`);
      } else {
        console.log(`>${op}`);
      }
      const command = [op.charCodeAt(0), ...args];
      // console.log(command)
      return new Promise((resolve) => {
        const resBytes: number[] = [];
        const onData = (data: any) => {
          const ar = [...new Uint8Array(data)];
          console.log(bytesToHexString(ar));
          resBytes.push(...ar);
          if (resBytes.length >= lengthToRead) {
            this.port.off('data', onData);
            resolve(resBytes);
          }
        };
        this.port.on('data', onData);
        this.port.write(command);
      });
    }
  }

  const expectedValues = {
    softwareIdentifier: [0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e], //CATERIN
    bootloaderVersion: [0x31, 0x30],
    hardwareVersion: [0x3f],
    programmerType: [0x53],
    signatureBytes: [0x87, 0x95, 0x1e],
    supportedDeviceTypes: [0x44, 0x00],
    autoIncrementSupported: [0x59],
    blockSize: [0x59, 0x00, 0x80],
    fuseLow: [0xff],
    fuseHigh: [0xd8],
    fuseEx: [0xfb]
  };

  function checkValue(res: number[], expected: number[], fieldSig: string) {
    if (JSON.stringify(res) !== JSON.stringify(expected)) {
      throw new Error(`incompatible ${fieldSig} ${JSON.stringify(res)}`);
    }
  }

  function checkAck(res: number[], op: string) {
    const isOk = res.length === 1 && res[0] === 0x0d;
    if (!isOk) {
      throw new Error(`operation ${op} failed.`);
    }
  }

  async function executeFlashCommandSequence(
    serial: SerialPortBridge,
    sourceBlocks: number[][]
  ) {
    console.log('start');
    const resSoftwareIdentifier = await serial.query('S');
    const resBootloaderVersion = await serial.query('V');
    const resHardwareVersion = await serial.query('v');
    const resProgrammerType = await serial.query('p');
    const resSignatureBytes = await serial.query('s');
    checkValue(
      resSoftwareIdentifier,
      expectedValues.softwareIdentifier,
      'software identifier'
    );
    checkValue(
      resBootloaderVersion,
      expectedValues.bootloaderVersion,
      'bootloader version'
    );
    checkValue(
      resHardwareVersion,
      expectedValues.hardwareVersion,
      'hardware version'
    );
    checkValue(
      resProgrammerType,
      expectedValues.programmerType,
      'programmer type'
    );
    checkValue(
      resSignatureBytes,
      expectedValues.signatureBytes,
      'signature bytes'
    );

    const resSupportedDeviceTypes = await serial.query('t');
    checkValue(
      resSupportedDeviceTypes,
      expectedValues.supportedDeviceTypes,
      'supported devices types'
    );

    const resSelectDeviceType = await serial.query(
      'T',
      resSupportedDeviceTypes[0]
    );
    checkAck(resSelectDeviceType, 'select device type');

    const resAutoIncrementSupported = await serial.query('a');
    const resBlockSize = await serial.query('b');
    checkValue(
      resAutoIncrementSupported,
      expectedValues.autoIncrementSupported,
      'auto increment supported'
    );
    checkValue(resBlockSize, expectedValues.blockSize, 'block size');

    const resFuseLow = await serial.query('F');
    checkValue(resFuseLow, expectedValues.fuseLow, 'fuse low byte');

    const resFuseHigh = await serial.query('N');
    checkValue(resFuseHigh, expectedValues.fuseHigh, 'fuse high byte');

    const resFuseEx = await serial.query('Q');
    checkValue(resFuseEx, expectedValues.fuseEx, 'fuse ex byte');

    const resEnterProgramimgMode = await serial.query('P');
    checkAck(resEnterProgramimgMode, 'enter programing mode');

    if (1) {
      const resErase = await serial.query('e');
      checkAck(resErase, 'erase');
      console.log(`erase done`);

      for (let i = 0; i < sourceBlocks.length; i++) {
        //write one block, 64words, 128bytes
        const addr = i * 64;
        const resSetAddress = await serial.query('A', bhi(addr), blo(addr));
        checkAck(resSetAddress, 'set address');
        const resWriteBlock = await serial.query(
          'B',
          0x00,
          0x80,
          0x46,
          ...sourceBlocks[i]
        );
        checkAck(resWriteBlock, 'write block');
        console.log(`block ${i} written`);
      }
    }

    const readBlocks: number[][] = [];

    for (let i = 0; i < sourceBlocks.length; i++) {
      //read one block, 64words, 128bytes
      const addr = i * 64;
      const resSetAddress = await serial.query('A', bhi(addr), blo(addr));
      checkAck(resSetAddress, 'set address');
      // const blockBytes = await query('g', 0x00, 0x80, 0x46)
      const blockBytes = await serial.queryEx('g', [0x00, 0x80, 0x46], 128);
      // console.log({blockBytes})
      readBlocks.push(blockBytes);
    }

    const resLeaveProgramingMode = await serial.query('L');
    checkAck(resLeaveProgramingMode, 'leave programing mode');

    // console.log({sourceBlocks})
    // console.log({readBlocks})

    console.log(`verifying...`);

    for (let i = 0; i < sourceBlocks.length; i++) {
      const isVarid =
        JSON.stringify(sourceBlocks[i]) === JSON.stringify(readBlocks[i]);
      // console.log('--------');
      // console.log(bytesToHexString(sourceBlocks[i]));
      // console.log(bytesToHexString(readBlocks[i]));
      console.log(`block ${i}, isValid:${isVarid}`);
    }

    const verifyOk = readBlocks.every(
      (blk, i) => JSON.stringify(blk) === JSON.stringify(sourceBlocks[i])
    );
    console.log(`verify ${verifyOk ? 'ok' : 'ng'}`);
    if (!verifyOk) {
      throw new Error('verify failed');
    }

    await serial.query('E'); //exit

    serial.close();
  }

  export async function uploadFirmware(
    hexFilePath: string,
    comPortName: string
  ): Promise<'ok' | string> {
    try {
      const sourceBlocks = readHexFileBytesBlocks(hexFilePath);
      const serial = new SerialPortBridge(comPortName);
      await executeFlashCommandSequence(serial, sourceBlocks);
      return 'ok';
    } catch (err) {
      return err;
    }
  }
}
