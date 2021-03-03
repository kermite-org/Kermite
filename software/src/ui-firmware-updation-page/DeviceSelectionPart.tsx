import { css, FC, jsx } from 'qx';
import { ipcAgent, ISelectorOption, useEventSource } from '~/ui-common';
import { FlatListSelector } from '~/ui-common/components/controls/FlatListSelector';

const style = css`
  * + * {
    margin-top: 5px;
  }

  .selector {
    width: 240px;
  }
`;
export const DeviceSelectionPart: FC = () => {
  const selectionInfos = useEventSource(
    ipcAgent.events.device_deviceSelectionEvents,
    {
      allDeviceInfos: [],
      currentDevicePath: 'none',
    },
  );
  const noneOption: ISelectorOption = { label: 'none', value: 'none' };
  const deviceOptionsBase: ISelectorOption[] = selectionInfos.allDeviceInfos.map(
    (info) => ({ label: info.displayName, value: info.path }),
  );
  const deviceOptions = [noneOption, ...deviceOptionsBase];

  const onChange = (path: string) => {
    ipcAgent.async.device_connectToDevice(path);
  };

  const deviceStatus = useEventSource(
    ipcAgent.events.device_keyboardDeviceStatusEvents,
    {
      isConnected: false,
    },
  );

  const connectedKeyboardName =
    (deviceStatus.isConnected && deviceStatus.deviceAttrs?.keyboardName) ||
    'no connection';

  return (
    <div css={style}>
      <div>Device Selection</div>
      <div>connected keyboard: {connectedKeyboardName}</div>
      <FlatListSelector
        options={deviceOptions}
        value={selectionInfos.currentDevicePath}
        setValue={onChange}
        size={5}
        className="selector"
      />
    </div>
  );
};
