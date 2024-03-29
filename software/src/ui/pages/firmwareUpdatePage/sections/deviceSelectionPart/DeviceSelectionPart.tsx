import { css, FC, jsx } from 'alumina';
import { ipcAgent, texts } from '~/ui/base';
import { FlatListSelector } from '~/ui/components';
import { PartBody, PartHeader } from '~/ui/pages/firmwareUpdatePage/Components';
import { useDeviceSelectionPartModel } from '~/ui/pages/firmwareUpdatePage/sections/deviceSelectionPart/deviceSelectionPartModel';

export const DeviceSelectionPart: FC = () => {
  const { deviceOptions, currentDevicePath, setSelectedDevicePath } =
    useDeviceSelectionPartModel();

  const onSelectionButton = () => {
    ipcAgent.async.device_requestAddNewHidDevice();
  };
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
        <div>
          <button onClick={onSelectionButton}>add device</button>
        </div>
      </PartBody>
    </div>
  );
};

const style = css`
  > .part-body {
    > .selector {
      width: 300px;
    }
  }
`;
