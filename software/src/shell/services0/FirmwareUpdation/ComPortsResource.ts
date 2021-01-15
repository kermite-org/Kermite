import SerialPort = require('serialport');

export class ComPortsResource {
  static async getComPortNames() {
    const ports = await SerialPort.list();
    return ports.map((port) => port.path);
  }
}
