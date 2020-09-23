import SerialPort = require('serialport');

import { readHexFileBytesBlocks } from './HexFileReader';
import { bytesToHexString, bhi, blo } from './helpers';

export function bytesToHexStringWithOmit(bytes: number[], maxLen: number) {
  if (bytes.length > maxLen) {
    const core = bytes.slice(0, maxLen);
    return bytesToHexString(core) + ` ... (${bytes.length}bytes)`;
  } else {
    return bytesToHexString(bytes);
  }
}

export namespace FlashCommander {
  const logger = new (class {
    logText: string = '';

    reset() {
      this.logText = '';
    }

    log(text: string) {
      console.log(text);
      this.logText += `${text}\r\n`;
    }

    flush(): string {
      return this.logText;
    }
  })();

  const queryTimeoutMs = 3000;

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
        logger.log(`>${op} ${bytesToHexStringWithOmit(args, 8)}`);
      } else {
        logger.log(`>${op}`);
      }
      const command = [op.charCodeAt(0), ...args];
      // logger.log(command)
      return new Promise((resolve, reject) => {
        let received = false;

        let timerId: NodeJS.Timeout | undefined = undefined;
        const clearTimer = () => {
          if (timerId) {
            clearTimeout(timerId);
            timerId = undefined;
          }
        };

        const onData = (data: Buffer) => {
          // logger.log({data})
          const ar = new Uint8Array(data);
          const ar1 = [...ar];
          logger.log(bytesToHexString(ar1));
          received = true;

          this.port.off('data', onData);
          clearTimer();
          resolve(ar1);
        };

        const onTimeout = () => {
          if (!received) {
            this.port.off('data', onData);
            clearTimer();
            reject('read command response timed out');
          }
        };

        this.port.on('data', onData);
        timerId = setTimeout(onTimeout, queryTimeoutMs);

        this.port.write(command);
      });
    }

    queryWithFixedSizeRead(
      op: string,
      args: number[],
      lengthToRead: number
    ): Promise<number[]> {
      if (args.length > 0) {
        logger.log(`>${op} ${bytesToHexString(args)}`);
      } else {
        logger.log(`>${op}`);
      }
      const command = [op.charCodeAt(0), ...args];
      // logger.log(command)
      return new Promise((resolve, reject) => {
        const resBytes: number[] = [];

        let timerId: NodeJS.Timeout | undefined = undefined;
        const clearTimer = () => {
          if (timerId) {
            clearTimeout(timerId);
            timerId = undefined;
          }
        };

        const onData = (data: any) => {
          const ar = [...new Uint8Array(data)];
          // logger.log(bytesToHexString(ar));
          resBytes.push(...ar);
          if (resBytes.length >= lengthToRead) {
            logger.log(`... ${resBytes.length}bytes read`);
            this.port.off('data', onData);
            clearTimer();
            resolve(resBytes);
          }
        };
        const onTimeout = () => {
          if (resBytes.length < lengthToRead) {
            //abort
            logger.log(bytesToHexString(resBytes));
            logger.log(`read ${resBytes.length} / ${lengthToRead} bytes`);
            this.port.off('data', onData);
            clearTimer();
            reject('read command response timed out');
          }
        };
        this.port.on('data', onData);
        timerId = setTimeout(onTimeout, queryTimeoutMs);
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
    logger.log('start');
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
      if (1) {
        const resErase = await serial.query('e');
        checkAck(resErase, 'erase');
        logger.log(`erase done`);
      }

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
        logger.log(`block ${i + 1}/${sourceBlocks.length} written`);
      }
    }

    logger.log(`verifying...`);

    for (let i = 0; i < sourceBlocks.length; i++) {
      //read one block, 64words, 128bytes
      const addr = i * 64;
      const resSetAddress = await serial.query('A', bhi(addr), blo(addr));
      checkAck(resSetAddress, 'set address');
      // const blockBytes = await query('g', 0x00, 0x80, 0x46)
      const blockBytes = await serial.queryWithFixedSizeRead(
        'g',
        [0x00, 0x80, 0x46],
        128
      );
      // logger.log({blockBytes})
      const isVarid =
        JSON.stringify(sourceBlocks[i]) === JSON.stringify(blockBytes);

      logger.log(
        `block ${i + 1}/${sourceBlocks.length} ${
          isVarid ? 'verified' : 'verify failed'
        }`
      );
      if (!isVarid) {
        throw new Error('verify failed');
      }
    }

    logger.log(`verification complete!`);

    const resLeaveProgramingMode = await serial.query('L');
    checkAck(resLeaveProgramingMode, 'leave programing mode');

    await serial.query('E'); //exit

    serial.close();
  }

  export async function uploadFirmware(
    hexFilePath: string,
    comPortName: string
  ): Promise<'ok' | string> {
    let serial: SerialPortBridge | undefined = undefined;

    logger.reset();
    try {
      logger.log(`#### start firmware upload`);
      const sourceBlocks = readHexFileBytesBlocks(hexFilePath);
      serial = new SerialPortBridge(comPortName);
      await executeFlashCommandSequence(serial, sourceBlocks);
      logger.log(`#### firmware upload complete`);
      return 'ok';
    } catch (err) {
      logger.log(`#### an error occured while writing firmware`);
      logger.log(`error: ${err}`);
      if (serial) {
        serial.close();
      }
      return logger.flush();
    }
  }
}
