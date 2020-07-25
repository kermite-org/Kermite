import * as SerialPort from 'serialport';

export class SerialPortResource {
  static async getComPortNames() {
    const ports = await SerialPort.list();
    return ports.map((port) => port.path);
  }
}
