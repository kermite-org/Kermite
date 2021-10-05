import { ICustomFirmwareInfo, IFirmwareTargetDevice } from '~/shared';
import { appConfig } from '~/shell/base';
import { cacheRemoteResource, fetchJson } from '~/shell/funcs';

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

export const CustomFirmwareInfoProvider = {
  async getAllCustomFirmwareInfos(): Promise<ICustomFirmwareInfo[]> {
    const { onlineResourcesBaseUrl } = appConfig;
    const data = (await cacheRemoteResource(
      fetchJson,
      `${onlineResourcesBaseUrl}/index.firmwares.json`,
    )) as IIndexFirmwaresContent;
    return data.firmwares.map(mapIndexFirmwareEntryToCustomFirmwareInfo);
  },
};
