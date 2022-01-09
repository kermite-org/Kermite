import { css, FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import { FlatListSelector } from '~/ui/components';
import { PartBody, PartHeader } from '~/ui/pages/FirmwareUpdatePage/Components';
import { useDeviceSelectionPartModel } from '~/ui/pages/FirmwareUpdatePage/sections/DeviceSelectionPart/DeviceSelectionPartModel';

export const DeviceSelectionPart: FC = () => {
  const { deviceOptions, currentDevicePath, setSelectedDevicePath } =
    useDeviceSelectionPartModel();
  return (
    <div class={style}>
      <PartHeader>{texts.deviceSelection.sectionTitle}</PartHeader>
      <PartBody class="part-body">
        {/* <div>connected keyboard: {connectedKeyboardName}</div> */}
        <FlatListSelector
          options={deviceOptions}
          value={currentDevicePath}
          setValue={setSelectedDevicePath}
          size={5}
          class="selector"
          hint={texts.deviceSelectionHint.selectionArea}
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
