import { FC, jsx } from 'alumina';
import { ISelectorOptionN, texts } from '~/app-shared';
import { CheckBoxLine, GeneralSelectorN, ToggleSwitch } from '~/fe-shared';
// import {
//   useRoutingChannelModel,
//   useSystemLayoutModel,
// } from '~/ui/commonModels';
// import { profilesOperationReader } from '~/ui/pages/assignerPage/ui_bar_profileManagement/viewModels/profilesOperationModel.Readers';
// import { keyboardBehaviorModeModule } from '~/ui/store';
import { profileEditorConfig } from '../../adapters';

const { keyboardBehaviorModeModule } = profileEditorConfig;

const localReaders = {
  get canEditDeviceAttrs() {
    // return uiReaders.isDeviceConnected;
    return profileEditorConfig.CanWriteKeyMappingToDevice;
  },
};

export const BehaviorSelector: FC = () => {
  const { isSimulatorMode, setSimulatorMode } = keyboardBehaviorModeModule;
  const { canEditDeviceAttrs } = localReaders;
  return (
    <CheckBoxLine
      checked={isSimulatorMode}
      setChecked={setSimulatorMode}
      disabled={!canEditDeviceAttrs}
      text="Simulator"
    />
  );
};

export const MuteModeSelector: FC = () => {
  const { isMuteMode, setMuteMode } = keyboardBehaviorModeModule;
  const { canEditDeviceAttrs } = localReaders;
  return (
    <CheckBoxLine
      checked={isMuteMode}
      setChecked={setMuteMode}
      disabled={!canEditDeviceAttrs}
      text="Mute"
    />
  );
};

export const BehaviorSelector2: FC = () => {
  const { isSimulatorMode, setSimulatorMode } = keyboardBehaviorModeModule;
  const { canEditDeviceAttrs } = localReaders;
  return (
    <ToggleSwitch
      checked={isSimulatorMode}
      onChange={setSimulatorMode}
      disabled={!canEditDeviceAttrs}
      hint={texts.assignerDeviceSettingsPartHint.simulatorMode}
    />
  );
};

export const MuteModeSelector2: FC = () => {
  const { isMuteMode, setMuteMode } = keyboardBehaviorModeModule;
  const { canEditDeviceAttrs } = localReaders;
  return (
    <ToggleSwitch
      checked={isMuteMode}
      onChange={setMuteMode}
      disabled={!canEditDeviceAttrs}
      hint={texts.assignerDeviceSettingsPartHint.muteMode}
    />
  );
};

export const LayoutStandardSelector: FC = () => {
  const { systemLayoutIndex, setSystemLayoutIndex } =
    profileEditorConfig.useSystemLayoutModel();
  const { canEditDeviceAttrs } = localReaders;
  const options: ISelectorOptionN[] = [
    { value: 0, label: 'US' },
    { value: 1, label: 'JIS' },
  ];
  return (
    <GeneralSelectorN
      options={options}
      value={systemLayoutIndex}
      setValue={setSystemLayoutIndex}
      disabled={!canEditDeviceAttrs}
      hint={texts.assignerDeviceSettingsPartHint.systemLayout}
    />
  );
};

export const RoutingChannelSelector: FC = () => {
  const { routingChannel, setRoutingChannel } =
    profileEditorConfig.useRoutingChannelModel();
  const { canEditDeviceAttrs } = localReaders;
  const options: ISelectorOptionN[] = [
    { value: 0, label: 'Main' },
    { value: 1, label: 'Alter' },
  ];
  return (
    <GeneralSelectorN
      options={options}
      value={routingChannel}
      setValue={setRoutingChannel}
      disabled={!canEditDeviceAttrs}
      hint={texts.assignerDeviceSettingsPartHint.routingChannel}
    />
  );
};
