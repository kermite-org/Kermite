import { css, FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { FlatListSelector } from '~/ui/components';
import { useDeviceSelectionPartModel } from '~/ui/pages/firmware-update-page/models';

export const DeviceSelectionPart: FC = () => {
  const {
    deviceOptions,
    currentDevicePath,
    setSelectedDevicePath,
  } = useDeviceSelectionPartModel();
  return (
    <div css={style}>
      <div>{texts.label_device_deviceSelection_sectionTitle}</div>
      {/* <div>connected keyboard: {connectedKeyboardName}</div> */}
      <FlatListSelector
        options={deviceOptions}
        value={currentDevicePath}
        setValue={setSelectedDevicePath}
        size={5}
        className="selector"
        hint={texts.hint_device_deviceSelection_selectionArea}
      />
    </div>
  );
};

const style = css`
  * + * {
    margin-top: 5px;
  }

  .selector {
    width: 300px;
  }
`;
