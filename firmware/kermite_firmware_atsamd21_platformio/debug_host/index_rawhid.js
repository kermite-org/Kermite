const HID = require("node-hid");

function openTargetDevice(venderId, productId, pathSearchWord) {
  const allDeviceInfos = HID.devices();
  // console.log(allDeviceInfos);
  const targetDeviceInfo = allDeviceInfos.find(
    d =>
      d.vendorId == venderId &&
      d.productId == productId &&
      d.path &&
      d.path.indexOf(pathSearchWord) >= 0
  );
  // console.log(targetDeviceInfo);
  if (targetDeviceInfo) {
    return new HID.HID(targetDeviceInfo.path);
  } else {
    return undefined;
  }
}

function start() {
  const device = openTargetDevice(0xf055, 0xa57a, "mi_03");
  if (!device) {
    console.log(`failed to open target device`);
    return;
  }
  console.log("device opened");
  device.on("data", data => console.log([...new Uint8Array(data)]));
}

start();
