import { css, FC, jsx } from 'qx';
import { IKeyboardDeviceInfo, IProjectResourceInfo } from '~/shared';
import { ipcAgent, ISelectorOption, texts } from '~/ui-common';
import { FlatListSelector } from '~/ui-common/components/controls/FlatListSelector';
import {
  useDeviceSelectionStatus,
  useProjectResourceInfos,
} from '~/ui-firmware-updation-page/dataSource';

const style = css`
  * + * {
    margin-top: 5px;
  }

  .selector {
    width: 300px;
  }
`;

function makeDeviceOptionEntry(
  deviceInfo: IKeyboardDeviceInfo,
  resourceInfos: IProjectResourceInfo[],
): ISelectorOption {
  const { path, portName, projectId } = deviceInfo;
  const project = resourceInfos.find((info) => info.projectId === projectId);
  const keyboardName = project?.keyboardName;
  const postfix = (keyboardName && ` (${keyboardName})`) || '';
  return {
    label: `device@${portName}${postfix}`,
    value: path,
  };
}
export const DeviceSelectionPart: FC = () => {
  const resourceInfos = useProjectResourceInfos();
  const selectionStatus = useDeviceSelectionStatus();
  const noneOption: ISelectorOption = { label: 'none', value: 'none' };
  const deviceOptionsBase: ISelectorOption[] = selectionStatus.allDeviceInfos.map(
    (deviceInfo) => makeDeviceOptionEntry(deviceInfo, resourceInfos),
  );
  const deviceOptions = [noneOption, ...deviceOptionsBase];

  const onChange = (path: string) => {
    ipcAgent.async.device_connectToDevice(path);
  };

  return (
    <div css={style}>
      <div>{texts.label_device_deviceSelection_sectionTitle}</div>
      {/* <div>connected keyboard: {connectedKeyboardName}</div> */}
      <FlatListSelector
        options={deviceOptions}
        value={selectionStatus.currentDevicePath}
        setValue={onChange}
        size={5}
        className="selector"
        hint={texts.hint_device_deviceSelection_selectionArea}
      />
    </div>
  );
};
