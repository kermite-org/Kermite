import { css, FC, jsx } from 'alumina';
import { Packets } from '~/shell/services/keyboardDevice/Packets';

async function setupDevice() {
  const devices = await navigator.hid.requestDevice({
    filters: [
      { vendorId: 0xf055, productId: 0xa577 },
      { vendorId: 0xf055, productId: 0xa579 },
    ],
  });

  console.log({ devices });

  const device = devices.find((d) => d.collections.length > 0);

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

export const DeviceDevelopmentPage: FC = () => {
  return (
    <div class={pageStyle}>
      <h2>device development page</h2>
      <button onClick={setupDevice}>connect</button>
    </div>
  );
};

const pageStyle = css`
  padding: 10px;
`;
