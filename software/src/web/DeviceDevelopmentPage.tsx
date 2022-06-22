import { css, FC, jsx, useEffect } from 'alumina';
import { Packets } from '~/shell/services/keyboardDevice/Packets';

async function openHidDevice(device: HIDDevice) {
  if (device) {
    await device.open();
    device.addEventListener('inputreport', (e: any) => {
      const bytes = [...new Uint8Array(e.data.buffer)];
      console.log('received', { bytes });
    });

    const sendFrame = (bytes: number[]) =>
      device.sendReport(0, new Uint8Array(bytes));

    sendFrame(Packets.deviceAttributesRequestFrame);
    // await delayMs(1000);
    // sendFrame(Packets.makeSimulatorModeSpecFrame(true));
    // await delayMs(1000);
    // sendFrame(Packets.makeSimulatorModeSpecFrame(false));
  }
}

async function connectToNewDevice() {
  const devices = (
    await navigator.hid.requestDevice({
      filters: [
        { vendorId: 0xf055, productId: 0xa577 },
        { vendorId: 0xf055, productId: 0xa579 },
      ],
    })
  ).filter((d) => d.collections.length > 0);

  console.log({ devices });

  const device = devices[0];
  openHidDevice(device);
}

async function reconnectToDevice() {
  const devices = (await navigator.hid.getDevices()).filter(
    (d) => d.collections.length > 0,
  );
  console.log({ devices });
  const device = devices[0];
  openHidDevice(device);
}

export const DeviceDevelopmentPage: FC = () => {
  useEffect(reconnectToDevice, []);
  return (
    <div class={pageStyle}>
      <h2>device development page</h2>
      <button onClick={connectToNewDevice}>connect</button>
    </div>
  );
};

const pageStyle = css`
  padding: 10px;
`;
