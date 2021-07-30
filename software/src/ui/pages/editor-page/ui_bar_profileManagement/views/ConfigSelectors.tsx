import { FC, jsx } from 'qx';
import { texts } from '~/ui/base';
import { useDeviceStatusModel } from '~/ui/commonModels';
import { useKeyboardBehaviorModeModel } from '~/ui/commonModels/KeyboardBehaviorModeModel';
import {
  useRoutingChannelModel,
  useSystemLayoutModel,
} from '~/ui/commonModels/ParameterBasedModeModels';
import { CheckBoxLine, DualItemsHoverSelector } from '~/ui/components';

export const BehaviorSelector: FC = () => {
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

export const MuteModeSelector: FC = () => {
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

export const LayoutStandardSelector: FC = () => {
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

export const RoutingChannelSelector: FC = () => {
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
