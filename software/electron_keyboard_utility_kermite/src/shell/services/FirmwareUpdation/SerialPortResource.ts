import * as SerialPort from 'serialport';

export class SerialPortResource {
  static async getComPortNames() {
    return SerialPort.list();
  }
}
