import { FC, jsx } from 'alumina';
import { texts } from '~/ui/base';
import {
  useRoutingChannelModel,
  useSystemLayoutModel,
} from '~/ui/commonModels/ParameterBasedModeModels';
import {
  CheckBoxLine,
  DualItemsHoverSelector,
  ToggleSwitch,
} from '~/ui/components';
import { keyboardBehaviorModeModule, uiReaders } from '~/ui/store';

export const BehaviorSelector: FC = () => {
  const { isSimulatorMode, setSimulatorMode } = keyboardBehaviorModeModule;
  const { isDeviceConnected } = uiReaders;
  return (
    <CheckBoxLine
      checked={isSimulatorMode}
      setChecked={setSimulatorMode}
      disabled={!isDeviceConnected}
      text="Simulator"
      hint={texts.assignerTopBarHint.keyboardBehaviorModeSelector}
    />
  );
};

export const MuteModeSelector: FC = () => {
  const { isMuteMode, setMuteMode } = keyboardBehaviorModeModule;
  const { isDeviceConnected } = uiReaders;
  return (
    <CheckBoxLine
      checked={isMuteMode}
      setChecked={setMuteMode}
      disabled={!isDeviceConnected}
      text="Mute"
    />
  );
};

export const BehaviorSelector2: FC = () => {
  const { isSimulatorMode, setSimulatorMode } = keyboardBehaviorModeModule;
  const { isDeviceConnected } = uiReaders;
  return (
    <ToggleSwitch
      checked={isSimulatorMode}
      onChange={setSimulatorMode}
      disabled={!isDeviceConnected}
    />
  );
};

export const MuteModeSelector2: FC = () => {
  const { isMuteMode, setMuteMode } = keyboardBehaviorModeModule;
  const { isDeviceConnected } = uiReaders;
  return (
    <ToggleSwitch
      checked={isMuteMode}
      onChange={setMuteMode}
      disabled={!isDeviceConnected}
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
  const { isDeviceConnected } = uiReaders;
  return (
    <DualItemsHoverSelector
      items={layoutIndices}
      currentItem={systemLayoutIndex}
      setCurrentItem={setSystemLayoutIndex}
      textDictionary={textDictionary}
      disabled={!isDeviceConnected}
      hint={texts.assignerTopBarHint.keyboardSystemLayoutSelector}
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
  const { isDeviceConnected } = uiReaders;
  return (
    <DualItemsHoverSelector
      items={channelValues}
      currentItem={routingChannel}
      setCurrentItem={setRoutingChannel}
      textDictionary={textDictionary}
      disabled={!isDeviceConnected}
      hint={texts.assignerTopBarHint.routingChannelSelector}
    />
  );
};
