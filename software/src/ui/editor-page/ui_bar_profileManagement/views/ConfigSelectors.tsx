import { jsx } from 'qx';
import { CheckBox, texts, useDeviceStatusModel } from '~/ui/common';
import { useKeyboardBehaviorModeModel } from '~/ui/common/sharedModels/KeyboardBehaviorModeModel';
import {
  useRoutingChannelModel,
  useSystemLayoutModel,
} from '~/ui/common/sharedModels/ParameterBasedModeModels';
import { DualItemsHoverSelector } from '~/ui/editor-page/components/fabrics/DualItemHoverSelector';

export const BehaviorSelector = () => {
  const { isSimulatorMode, setSimulatorMode } = useKeyboardBehaviorModeModel();
  const { isConnected } = useDeviceStatusModel();
  return (
    <div>
      <CheckBox
        checked={isSimulatorMode}
        setChecked={setSimulatorMode}
        disabled={!isConnected}
      />
      <div>SIM</div>
    </div>
    // <DualItemsHoverSelector
    //   items={modes}
    //   currentItem={behaviorMode}
    //   setCurrentItem={setBehaviorMode}
    //   textDictionary={textDictionary}
    //   disabled={!isConnected}
    //   hint={texts.hint_assigner_topBar_keyboardBehaviorModeSelector}
    // />
  );
};

export const LayoutStandardSelector = () => {
  const { systemLayoutIndex, setSystemLayoutIndex } = useSystemLayoutModel();
  const layoutIndices: number[] = [1, 2];
  const textDictionary: { [key in number]: string } = {
    1: 'US',
    2: 'JIS',
  };
  const { isConnected } = useDeviceStatusModel();
  return (
    <DualItemsHoverSelector
      items={layoutIndices}
      currentItem={systemLayoutIndex}
      setCurrentItem={setSystemLayoutIndex}
      textDictionary={textDictionary}
      disabled={!isConnected}
      hint={texts.hint_assigner_topBar_keyboardSystemLayoutSelector}
    />
  );
};

export const RoutingChannelSelector = () => {
  const { routingChannel, setRoutingChannel } = useRoutingChannelModel();
  const channelValues: number[] = [0, 1];
  const textDictionary: { [key in number]: string } = {
    0: 'Main',
    1: 'Alter',
  };
  const { isConnected } = useDeviceStatusModel();
  return (
    <DualItemsHoverSelector
      items={channelValues}
      currentItem={routingChannel}
      setCurrentItem={setRoutingChannel}
      textDictionary={textDictionary}
      disabled={!isConnected}
      hint={texts.hint_assigner_topBar_routingChannelSelector}
    />
  );
};
