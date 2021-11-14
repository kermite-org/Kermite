import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { FlatListSelector } from '~/ui/components';
import {
  PartBody,
  PartHeader,
} from '~/ui/pages/firmware-update-page/Components';
import { useDeviceSelectionPartModel } from '~/ui/pages/firmware-update-page/sections/DeviceSelectionPart/DeviceSelectionPartModel';

export const DeviceSelectionPart: FC = () => {
  const { deviceOptions, currentDevicePath, setSelectedDevicePath } =
    useDeviceSelectionPartModel();
  return (
    <div css={style}>
      <PartHeader>{texts.label_device_deviceSelection_sectionTitle}</PartHeader>
      <PartBody className="part-body">
        {/* <div>connected keyboard: {connectedKeyboardName}</div> */}
        <FlatListSelector
          options={deviceOptions}
          value={currentDevicePath}
          setValue={setSelectedDevicePath}
          size={5}
          className="selector"
          hint={texts.hint_device_deviceSelection_selectionArea}
        />
      </PartBody>
    </div>
  );
};

const style = css`
  > .part-body {
    .selector {
      width: 300px;
    }
  }
`;
