import {
  checkDeviceBootloaderMatch,
  getFirmwareTargetDeviceFromBaseFirmwareType,
  IBootloaderDeviceDetectionStatus,
  ICustomFirmwareInfo,
  IFirmwareOriginEx,
  IFirmwareTargetDevice,
  IProjectFirmwareEntry,
  IProjectPackageInfo,
} from '~/shared';
import { ipcAgent, ISelectorOption, ISelectorSource } from '~/ui/base';
import { modalAlert } from '~/ui/components';
import { projectPackagesReader, uiActions, uiReaders } from '~/ui/store';

export type FirmwareUpdatePhase =
  | 'WaitingReset'
  | 'WaitingUploadOrder'
  | 'Uploading'
  | 'UploadSuccess'
  | 'UploadFailure';

const helpers = {
  getTargetDeviceFromFirmwareInfo(
    entry: IProjectFirmwareEntry,
  ): IFirmwareTargetDevice | undefined {
    if (entry.type === 'standard') {
      return getFirmwareTargetDeviceFromBaseFirmwareType(
        entry.standardFirmwareConfig.baseFirmwareType,
      );
    }
    if (entry.type === 'custom') {
      const item = uiReaders.allCustomFirmwareInfos.find(
        (it) => it.firmwareId === entry.customFirmwareId,
      );
      return item?.targetDevice as IFirmwareTargetDevice;
    }
    return undefined;
  },

  createFirmwareOptions(
    projectInfosWithFirmware: IProjectPackageInfo[],
    allCustomFirmwareInfos: ICustomFirmwareInfo[],
  ): ISelectorOption[] {
    return projectInfosWithFirmware
      .map((info) =>
        info.firmwares.map((firmware) => {
          const projectOriginText =
            info.origin === 'local' ? '(local-package) ' : '';
          const { projectKey, keyboardName } = info;
          const { firmwareName, variationId } = firmware;
          if (firmware.type === 'standard') {
            return [
              {
                value: `${projectKey}:${variationId}:unspecified`,
                label: `${projectOriginText} ${keyboardName} ${firmwareName}`,
              },
            ];
          } else {
            const customFirmwares = allCustomFirmwareInfos.filter(
              (it) => it.firmwareId === firmware.customFirmwareId,
            );
            return customFirmwares.map((customFirmware) => {
              const { firmwareOrigin } = customFirmware;
              const firmwareOriginText =
                (firmwareOrigin === 'localBuild' && '(local-build)') || '';
              return {
                value: `${projectKey}:${variationId}:${firmwareOrigin}`,
                label: `${projectOriginText} ${keyboardName} ${firmwareName} ${firmwareOriginText}`,
              };
            });
          }
        }),
      )
      .flat()
      .flat();
  },
};

const state = new (class {
  currentProjectFirmwareSpec: string = ''; // `${projectKey}:${variationId}:${firmwareOrigin}`
  phase: FirmwareUpdatePhase = 'WaitingReset';
  firmwareUploadResult: string | undefined = undefined;
  deviceDetectionStatus: IBootloaderDeviceDetectionStatus = {
    detected: false,
  };
})();

const readers = {
  get projectInfosWithFirmware(): IProjectPackageInfo[] {
    return projectPackagesReader
      .getProjectInfosGlobalProjectSelectionAffected()
      .filter((info) => info.firmwares.length > 0);
  },

  get detectedDeviceSig(): string | undefined {
    return (
      (state.deviceDetectionStatus.detected &&
        state.deviceDetectionStatus.targetDeviceSig) ||
      undefined
    );
  },
  get firmwareOptions(): ISelectorOption[] {
    const blankOption = { value: '', label: 'select firmware' };
    return [
      blankOption,
      ...helpers.createFirmwareOptions(
        readers.projectInfosWithFirmware,
        uiReaders.allCustomFirmwareInfos,
      ),
    ];
  },
  getFirmwareSelectionSource(): ISelectorSource {
    if (
      !readers.firmwareOptions.some(
        (option) => option.value === state.currentProjectFirmwareSpec,
      )
    ) {
      state.currentProjectFirmwareSpec = '';
    }
    return {
      options: readers.firmwareOptions,
      value: state.currentProjectFirmwareSpec,
      setValue: (spec: string) => (state.currentProjectFirmwareSpec = spec),
    };
  },
  get canSelectTargetFirmware() {
    const { phase } = state;
    return phase === 'WaitingReset' || phase === 'WaitingUploadOrder';
  },
  get canFlashSelectedFirmwareToDetectedDevice(): boolean {
    if (state.deviceDetectionStatus.detected) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [projectKey, variationId, _firmwareOrigin] =
        state.currentProjectFirmwareSpec.split(':');
      const projectInfo = readers.projectInfosWithFirmware.find((it) =>
        it.projectKey.startsWith(projectKey),
      );
      const firmwareInfo = projectInfo?.firmwares.find(
        (f) => f.variationId === variationId,
      );
      if (firmwareInfo) {
        const targetDevice =
          helpers.getTargetDeviceFromFirmwareInfo(firmwareInfo);
        return (
          !!targetDevice &&
          checkDeviceBootloaderMatch(
            state.deviceDetectionStatus.bootloaderType,
            targetDevice,
          )
        );
      }
    }
    return false;
  },
};

const actions = {
  // 0: WaitingReset
  backToInitialPhase() {
    state.phase = 'WaitingReset';
  },

  // 1: WaitingReset --> WaitingUploadOrder
  setDeviceStatus(deviceDetectionStatus: IBootloaderDeviceDetectionStatus) {
    state.deviceDetectionStatus = deviceDetectionStatus;
    if (
      state.phase === 'WaitingReset' &&
      state.deviceDetectionStatus.detected
    ) {
      state.phase = 'WaitingUploadOrder';
    }
    if (
      state.phase === 'WaitingUploadOrder' &&
      !state.deviceDetectionStatus.detected
    ) {
      state.phase = 'WaitingReset';
    }
  },

  // 2: WaitingUploadOrder --> Uploading --> UploadSuccess,UploadFailure
  async uploadFirmware() {
    if (!state.currentProjectFirmwareSpec) {
      await modalAlert('please select firmware');
      return;
    }
    if (
      state.phase === 'WaitingUploadOrder' &&
      state.deviceDetectionStatus.detected
    ) {
      const [projectKey, variationId, firmwareOrigin] =
        state.currentProjectFirmwareSpec.split(':');
      const projectInfo = readers.projectInfosWithFirmware.find((it) =>
        it.projectKey.startsWith(projectKey),
      );
      if (projectInfo) {
        state.phase = 'Uploading';
        uiActions.setLoading();
        const res = await ipcAgent.async.firmup_uploadFirmware(
          projectInfo.origin,
          projectInfo.projectId,
          variationId,
          firmwareOrigin as IFirmwareOriginEx,
        );
        uiActions.clearLoading();
        state.firmwareUploadResult = res;
        if (res === 'ok') {
          state.phase = 'UploadSuccess';
        } else {
          state.phase = 'UploadFailure';
        }
      }
    }
  },
};

export const firmwareUpdateModel = {
  state,
  readers,
  actions,
};
