import { css, FC, jsx } from 'qx';
import { ipcAgent, ISelectorOption } from '~/ui-common';
import { FlatListSelector } from '~/ui-common/components/controls/FlatListSelector';
import { useDeviceSelectionStatus } from '~/ui-firmware-updation-page/dataSource';

const style = css`
  * + * {
    margin-top: 5px;
  }

  .selector {
    width: 240px;
  }
`;

export const DeviceSelectionPart: FC = () => {
  const selectionStatus = useDeviceSelectionStatus();
  const noneOption: ISelectorOption = { label: 'none', value: 'none' };
  const deviceOptionsBase: ISelectorOption[] = selectionStatus.allDeviceInfos.map(
    (info) => ({
      label: `device@${info.portName} (${info.serialNumber})`,
      value: info.path,
    }),
  );
  const deviceOptions = [noneOption, ...deviceOptionsBase];

  const onChange = (path: string) => {
    ipcAgent.async.device_connectToDevice(path);
  };

  return (
    <div css={style}>
      <div>Device Selection</div>
      {/* <div>connected keyboard: {connectedKeyboardName}</div> */}
      <FlatListSelector
        options={deviceOptions}
        value={selectionStatus.currentDevicePath}
        setValue={onChange}
        size={5}
        className="selector"
      />
    </div>
  );
};
