function createProfileEditorConfig() {
  return {
    settings: {
      siteDpiScale: 1,
    },
    deviceStatus: {
      isConnected: false,
    },
    isEditProfileAvailable: true,
    allProjectPackageInfos: [] as {
      keyboardName: string;
      projectId: string;
    }[],
    activeProjectPackageInfos: [] as {
      keyboardName: string;
      projectId: string;
    }[],
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
      writeKeymapping() {},
    },
  };
}

export const profileEditorConfig = createProfileEditorConfig();
