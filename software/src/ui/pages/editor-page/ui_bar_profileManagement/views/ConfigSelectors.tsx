import { jsx } from 'qx';
import { texts } from '~/ui/base';
import { useDeviceStatusModel } from '~/ui/commonModels';
import { useKeyboardBehaviorModeModel } from '~/ui/commonModels/KeyboardBehaviorModeModel';
import {
  useRoutingChannelModel,
  useSystemLayoutModel,
} from '~/ui/commonModels/ParameterBasedModeModels';
import { CheckBoxLine } from '~/ui/components';
import { DualItemsHoverSelector } from '~/ui/components/editorParts';

export const BehaviorSelector = () => {
  const { isSimulatorMode, setSimulatorMode } = useKeyboardBehaviorModeModel();
  const { isConnected } = useDeviceStatusModel();
  return (
    <CheckBoxLine
      checked={isSimulatorMode}
      setChecked={setSimulatorMode}
      disabled={!isConnected}
      text="Simulator"
      hint={texts.hint_assigner_topBar_keyboardBehaviorModeSelector}
    />
  );
};

export const MuteModeSelector = () => {
  const { isMuteMode, setMuteMode } = useKeyboardBehaviorModeModel();
  const { isConnected } = useDeviceStatusModel();
  return (
    <CheckBoxLine
      checked={isMuteMode}
      setChecked={setMuteMode}
      disabled={!isConnected}
      text="Mute"
    />
  );
};

export const LayoutStandardSelector = () => {
  const { systemLayoutIndex, setSystemLayoutIndex } = useSystemLayoutModel();
  const layoutIndices: number[] = [0, 1];
  const textDictionary: { [key in number]: string } = {
    0: 'US',
    1: 'JIS',
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
