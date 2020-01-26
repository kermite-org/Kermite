import * as HID from 'node-hid';

function getArrayFromBuffer(data: any) {
  return new Uint8Array(Buffer.from(data));
}

type IReceiverFunc = (buf: Uint8Array) => void;

export class DeviceWrapper {
  private device?: HID.HID | null = null;
  private receiverFunc?: IReceiverFunc;

  private static openTargetDevice(
    venderId: number,
    productId: number,
    pathSearchWord: string
  ): HID.HID | null {
    const allDeviceInfos = HID.devices();
    const targetDeviceInfo = allDeviceInfos.find(
      d =>
        d.vendorId === venderId &&
        d.productId === productId &&
        d.path &&
        d.path.indexOf(pathSearchWord) >= 0
    );
    if (targetDeviceInfo && targetDeviceInfo.path) {
      return new HID.HID(targetDeviceInfo.path);
    } else {
      return null;
    }
  }

  open(venderId: number, productId: number, pathSearchWord: string): boolean {
    this.device = DeviceWrapper.openTargetDevice(
      venderId,
      productId,
      pathSearchWord
    );
    if (this.device) {
      this.device.on('data', data => {
        const buf = getArrayFromBuffer(data);
        if (this.receiverFunc) {
          this.receiverFunc(buf);
        }
      });
      this.device.on('error', error => {
        console.log(`error occured: ${error}`);
      });
      return true;
    } else {
      return false;
    }
  }

  close() {
    if (this.device) {
      this.device.close();
      this.device = null;
    }
  }

  setReceiverFunc(func: IReceiverFunc) {
    this.receiverFunc = func;
  }
}
