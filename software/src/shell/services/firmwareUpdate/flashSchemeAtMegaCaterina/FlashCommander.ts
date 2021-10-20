/* eslint-disable import/first */
import SerialPort = require('serialport');
import { compareArray, delayMs } from '~/shared';
import { CommandLogger } from '~/shell/services/firmwareUpdate/flashSchemeAtMegaCaterina/CommandLogger';
import { readHexFileBytesBlocks128 } from './HexFileReader';
import {
  bhi,
  blo,
  bytesToHexString,
  bytesToHexStringWithOmit,
} from './helpers';

export namespace FlashCommander {
  const logger = new CommandLogger();

  const queryTimeoutMs = 3000;

  function openSerial(path: string): Promise<SerialPort> {
    return new Promise((resolve, reject) => {
      const port = new SerialPort(path, (err) => {
        if (err) {
          reject(err);
        }
      });
      port.once('open', () => {
        console.log(`serial port opened: ${path}`);
        resolve(port);
      });
    });
  }
  class SerialPortBridge {
    port: SerialPort;
    rcvBuf: number[] = [];

    static async open(comPortName: string): Promise<SerialPortBridge> {
      const port = await openSerial(comPortName);
      return new SerialPortBridge(port);
    }

    private constructor(port: SerialPort) {
      this.port = port;
      this.port.on('data', this.onData);
    }

    onData = (data: Buffer) => {
      const arr = [...new Uint8Array(data)];
      this.rcvBuf.push(...arr);
    };

    close() {
      if (this.port) {
        this.port.off('data', this.onData);
        if (this.port.isOpen) {
          this.port.close();
          console.log(`serial port closed: ${this.port.path}`);
        }
      }
    }

    async query(op: string, readLength: number): Promise<number[]>;
    async query(
      op: string,
      params: number[],
      readLength: number,
    ): Promise<number[]>;
    async query(...args: any[]) {
      if (!this.port || !this.port.isOpen) {
        throw new Error('serial port is not open');
      }
      const op: string = args[0];
      const params: number[] = args.length === 3 ? args[1] : [];
      const readLength: number = args.length === 3 ? args[2] : args[1];
      logger.log(
        `>${op} ${
          params.length > 0 ? bytesToHexStringWithOmit(params, 10) : ''
        }`,
      );
      this.port.write([op.charCodeAt(0), ...params]);
      let cnt = 0;
      while (this.rcvBuf.length < readLength) {
        await delayMs(1);
        if (++cnt > queryTimeoutMs) {
          logger.log(bytesToHexString(this.rcvBuf));
          logger.log(`reading ${this.rcvBuf.length} / ${readLength} bytes`);
          throw new Error(`serial read timeout`);
        }
      }
      const res = this.rcvBuf;
      logger.log(bytesToHexStringWithOmit(res, 10));
      this.rcvBuf = [];
      return res;
    }
  }

  const expectedValues = {
    S_softwareIdentifier: [0x43, 0x41, 0x54, 0x45, 0x52, 0x49, 0x4e], // CATERIN
    V_bootloaderVersion: [0x31, 0x30],
    v_hardwareVersion: [0x3f],
    p_programmerType: [0x53],
    s_signatureBytes: [0x87, 0x95, 0x1e],
    t_supportedDeviceTypes: [0x44, 0x00],
    a_autoIncrementSupported: [0x59],
    b_blockSize: [0x59, 0x00, 0x80],
    F_fuseLow: [0xff],
    N_fuseHigh: [0xd8],
    Q_fuseEx: [0xfb],
  };

  function checkValue(res: number[], expected: number[], fieldSig: string) {
    if (!compareArray(res, expected)) {
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
    sourceBlocks: number[][],
  ) {
    logger.log('start');
    const resSoftwareIdentifier = await serial.query('S', 7);
    const resBootloaderVersion = await serial.query('V', 2);
    const resHardwareVersion = await serial.query('v', 1);
    const resProgrammerType = await serial.query('p', 1);
    const resSignatureBytes = await serial.query('s', 3);
    checkValue(
      resSoftwareIdentifier,
      expectedValues.S_softwareIdentifier,
      'software identifier',
    );
    checkValue(
      resBootloaderVersion,
      expectedValues.V_bootloaderVersion,
      'bootloader version',
    );
    checkValue(
      resHardwareVersion,
      expectedValues.v_hardwareVersion,
      'hardware version',
    );
    checkValue(
      resProgrammerType,
      expectedValues.p_programmerType,
      'programmer type',
    );
    checkValue(
      resSignatureBytes,
      expectedValues.s_signatureBytes,
      'signature bytes',
    );

    const resSupportedDeviceTypes = await serial.query('t', 2);
    checkValue(
      resSupportedDeviceTypes,
      expectedValues.t_supportedDeviceTypes,
      'supported devices types',
    );

    const deviceType = resSupportedDeviceTypes[0];
    const resSelectDeviceType = await serial.query('T', [deviceType], 1);
    checkAck(resSelectDeviceType, 'select device type');

    const resAutoIncrementSupported = await serial.query('a', 1);
    const resBlockSize = await serial.query('b', 3);
    checkValue(
      resAutoIncrementSupported,
      expectedValues.a_autoIncrementSupported,
      'auto increment supported',
    );
    checkValue(resBlockSize, expectedValues.b_blockSize, 'block size');

    const resFuseLow = await serial.query('F', 1);
    checkValue(resFuseLow, expectedValues.F_fuseLow, 'fuse low byte');

    const resFuseHigh = await serial.query('N', 1);
    checkValue(resFuseHigh, expectedValues.N_fuseHigh, 'fuse high byte');

    // const resFuseEx = await serial.query('Q', 1);
    // checkValue(resFuseEx, expectedValues.fuseEx, 'fuse ex byte');

    const resEnterProgramimgMode = await serial.query('P', 1);
    checkAck(resEnterProgramimgMode, 'enter programing mode');

    logger.log(`erasing...`);

    const resErase = await serial.query('e', 1);
    checkAck(resErase, 'erase');
    logger.log(`erase done`);

    logger.log(`writing...`);

    for (let i = 0; i < sourceBlocks.length; i++) {
      // write one block, 64words, 128bytes
      const addr = i * 64;
      const resSetAddress = await serial.query('A', [bhi(addr), blo(addr)], 1);
      checkAck(resSetAddress, 'set address');
      const resWriteBlock = await serial.query(
        'B',
        [0x00, 0x80, 0x46, ...sourceBlocks[i]],
        1,
      );
      checkAck(resWriteBlock, 'write block');
      logger.log(`block ${i + 1}/${sourceBlocks.length} written`);
    }

    logger.log(`write done`);
    logger.log(`verifying...`);

    for (let i = 0; i < sourceBlocks.length; i++) {
      // read one block, 64words, 128bytes
      const addr = i * 64;
      const resSetAddress = await serial.query('A', [bhi(addr), blo(addr)], 1);
      checkAck(resSetAddress, 'set address');
      // const blockBytes = await query('g', 0x00, 0x80, 0x46)
      const blockBytes = await serial.query('g', [0x00, 0x80, 0x46], 128);
      // logger.log({blockBytes})
      const isValid =
        JSON.stringify(sourceBlocks[i]) === JSON.stringify(blockBytes);

      logger.log(
        `block ${i + 1}/${sourceBlocks.length} ${
          isValid ? 'verified' : 'verify failed'
        }`,
      );
      if (!isValid) {
        throw new Error('verify failed');
      }
    }

    logger.log(`verification complete!`);

    const resLeaveProgramingMode = await serial.query('L', 1);
    checkAck(resLeaveProgramingMode, 'leave programing mode');

    await serial.query('E', 1); // exit

    serial.close();
  }

  export async function uploadFirmware(
    hexFilePath: string,
    comPortName: string,
  ): Promise<'ok' | string> {
    let serial: SerialPortBridge | undefined = undefined;

    logger.reset();
    try {
      logger.log(`#### start firmware upload`);
      const sourceBlocks = readHexFileBytesBlocks128(hexFilePath);
      serial = await SerialPortBridge.open(comPortName);
      await executeFlashCommandSequence(serial, sourceBlocks);
      logger.log(`#### firmware upload complete`);
      return 'ok';
    } catch (err: any) {
      logger.log(`#### an error occurred while writing firmware`);
      logger.log(`error: ${err.stack}`);
      if (serial) {
        serial.close();
      }
      return logger.flush();
    }
  }
}
