import { FC, jsx } from 'alumina';
import { ISelectorOptionN, texts } from '~/ui/base';
import {
  useRoutingChannelModel,
  useSystemLayoutModel,
} from '~/ui/commonModels/ParameterBasedModeModels';
import { CheckBoxLine, GeneralSelectorN, ToggleSwitch } from '~/ui/components';
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
      hint={texts.assignerDeviceSettingsPartHint.simulatorMode}
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
      hint={texts.assignerDeviceSettingsPartHint.muteMode}
    />
  );
};

export const LayoutStandardSelector: FC = () => {
  const { systemLayoutIndex, setSystemLayoutIndex } = useSystemLayoutModel();
  const { isDeviceConnected } = uiReaders;
  const options: ISelectorOptionN[] = [
    { value: 0, label: 'US' },
    { value: 1, label: 'JIS' },
  ];
  return (
    <GeneralSelectorN
      options={options}
      value={systemLayoutIndex}
      setValue={setSystemLayoutIndex}
      disabled={!isDeviceConnected}
      hint={texts.assignerDeviceSettingsPartHint.systemLayout}
    />
  );
};

export const RoutingChannelSelector: FC = () => {
  const { routingChannel, setRoutingChannel } = useRoutingChannelModel();
  const { isDeviceConnected } = uiReaders;
  const options: ISelectorOptionN[] = [
    { value: 0, label: 'Main' },
    { value: 1, label: 'Alter' },
  ];
  return (
    <GeneralSelectorN
      options={options}
      value={routingChannel}
      setValue={setRoutingChannel}
      disabled={!isDeviceConnected}
      hint={texts.assignerDeviceSettingsPartHint.routingChannel}
    />
  );
};
