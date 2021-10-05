import { ICustomFirmwareInfo, IFirmwareTargetDevice } from '~/shared';
import { appConfig } from '~/shell/base';
import { cacheRemoteResource, fetchJson } from '~/shell/funcs';

namespace OnlineFirmwareInfoLoader {
  type IIndexFirmwaresContent = {
    firmwares: {
      firmwareId: string;
      firmwareProjectPath: string;
      variationName: string;
      targetDevice: IFirmwareTargetDevice;
      buildResult: 'success' | 'failure';
      firmwareFileName: string;
      metadataFileName: string;
      releaseBuildRevision: number;
      buildTimestamp: string;
    }[];
  };

  function mapIndexFirmwareEntryToCustomFirmwareInfo(
    entry: IIndexFirmwaresContent['firmwares'][0],
  ): ICustomFirmwareInfo {
    return {
      firmwareOrigin: 'online',
      firmwareId: entry.firmwareId,
      firmwareProjectPath: entry.firmwareProjectPath,
      variationName: entry.variationName,
      targetDevice: entry.targetDevice,
      buildRevision: entry.releaseBuildRevision,
      buildTimestamp: entry.buildTimestamp,
    };
  }

  export async function loadOnlineFirmwareInfos() {
    const { onlineResourcesBaseUrl } = appConfig;
    const data = (await cacheRemoteResource(
      fetchJson,
      `${onlineResourcesBaseUrl}/index.firmwares.json`,
    )) as IIndexFirmwaresContent;
    return data.firmwares.map(mapIndexFirmwareEntryToCustomFirmwareInfo);
  }
}

const state = new (class {
  onlineFirmwareInfos: ICustomFirmwareInfo[] | undefined;
})();

export const CustomFirmwareInfoProvider = {
  async getAllCustomFirmwareInfos(): Promise<ICustomFirmwareInfo[]> {
    state.onlineFirmwareInfos ||=
      await OnlineFirmwareInfoLoader.loadOnlineFirmwareInfos();
    return state.onlineFirmwareInfos;
  },
};
