import { css, FC, jsx } from 'qx';
import { FlatListSelector } from '~/ui/common';
import { useDeviceSelectionPartModel } from '~/ui/firmware-updation-page/models';

const style = css`
  * + * {
    margin-top: 5px;
  }

  .selector {
    width: 300px;
  }
`;

export const DeviceSelectionPart: FC = () => {
  const {
    deviceOptions,
    currentDevicePath,
    setSelectedDevicePath,
  } = useDeviceSelectionPartModel();
  return (
    <div css={style}>
      <div>Device Selection</div>
      {/* <div>connected keyboard: {connectedKeyboardName}</div> */}
      <FlatListSelector
        options={deviceOptions}
        value={currentDevicePath}
        setValue={setSelectedDevicePath}
        size={5}
        className="selector"
      />
    </div>
  );
};
