function createProfileEditorConfig() {
  return {
    settings: {
      showLayersDynamic: false,
      showLayerDefaultAssign: false,
      showProfileAdvancedOptions: false,
      siteDpiScale: 1,
    },
    deviceStatus: {
      isConnected: false,
    },
    stopLiveMode() {},
    isEditProfileAvailable: true,
    commitUiSettings(_settings: {
      showLayersDynamic?: boolean;
      showLayerDefaultAssign?: boolean;
      showProfileAdvancedOptions?: boolean;
    }): void {},
    commitUiState(_args: any) {},
    allProjectPackageInfos: [] as {
      keyboardName: string;
      projectId: string;
    }[],
    activeProjectPackageInfos: [] as {
      keyboardName: string;
      projectId: string;
    }[],
    uiState: {
      // profileRoutingPanelVisible: false,
      // profileConfigModalVisible: false,
      showTestInputArea: false,
    },
    CanWriteKeyMappingToDevice: false,
    useSystemLayoutModel: () => ({
      systemLayoutIndex: 0,
      setSystemLayoutIndex(_index: number) {},
    }),
    useRoutingChannelModel: () => ({
      routingChannel: 0,
      setRoutingChannel(_index: number) {},
    }),
    keyboardBehaviorModeModule: {
      isSimulatorMode: false,
      setSimulatorMode(_mode: boolean) {},
      isMuteMode: false,
      setMuteMode(_mode: boolean) {},
    },
    readers: {
      get canWriteKeymapping() {
        return true;
      },
    },
    actions: {
      // openConfigurationModal() {},
      // toggleRoutingPanel() {},
      writeKeymapping() {},
    },
  };
}

export const profileEditorConfig = createProfileEditorConfig();
