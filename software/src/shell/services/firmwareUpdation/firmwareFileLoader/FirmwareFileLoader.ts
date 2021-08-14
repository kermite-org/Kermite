import {
  getFirmwareTargetDeviceFromBaseFirmwareType,
  IFirmwareTargetDevice,
  IProjectPackageInfo,
  IResourceOrigin,
  IStandardBaseFirmwareType,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  cacheRemoteResouce,
  fetchBinary,
  fetchJson,
  fsxMkdirpSync,
  fsxWriteFile,
  pathBasename,
  pathDirname,
} from '~/shell/funcs';
import { projectPackageProvider } from '~/shell/projectPackages/ProjectPackageProvider';
import { IFirmwareBinaryFileSpec } from '~/shell/projectResources';
import { applyStandardFirmwareBinaryPatch } from '~/shell/services/firmwareUpdation/firmwareBinaryPatchApplier/FirmwareBinaryPatchApplier';

const remoteBaseUrl = 'https://app.kermite.org/krs/resources2';

type IFirmwareFetchResult = { fileName: string; data: Uint8Array };
type IFirmwareFetchResultWithTargetDevice = {
  fileName: string;
  data: Uint8Array;
  targetDevice: IFirmwareTargetDevice;
};

const standardFirmwarePaths: {
  [key in IStandardBaseFirmwareType]?: string;
} = {
  AvrUnified: 'firmwares/standard/standard_avr.hex',
  RpUnified: 'firmwares/standard/standard_rp.uf2',
};

async function fetchStandardBaseFirmware(
  baseFirmwareType: IStandardBaseFirmwareType,
): Promise<IFirmwareFetchResult> {
  const path = standardFirmwarePaths[baseFirmwareType];
  if (!path) {
    throw new Error(`base firmware ${baseFirmwareType} is not supported yet`);
  }
  const url = `${remoteBaseUrl}/${path}`;
  const fileName = pathBasename(url);
  const data = await cacheRemoteResouce(fetchBinary, url);
  return { fileName, data };
}

type IFirmwareSummaryJson = {
  firmwares: {
    firmwareId: string;
    firmwareProjectPath: string;
    firmwareFileName: string;
    targetDevice: IFirmwareTargetDevice;
  }[];
};

async function fetchCustomFirmware(
  firmwareId: string,
): Promise<IFirmwareFetchResultWithTargetDevice | undefined> {
  const summaryUrl = `${remoteBaseUrl}/index.firmwares.json`;
  const summary = (await cacheRemoteResouce(
    fetchJson,
    summaryUrl,
  )) as IFirmwareSummaryJson;
  const entry = summary.firmwares.find((it) => it.firmwareId === firmwareId);
  if (entry) {
    const url = `${remoteBaseUrl}/firmwares/${entry.firmwareProjectPath}/${entry.firmwareFileName}`;
    const data = await cacheRemoteResouce(fetchBinary, url);
    return {
      fileName: entry.firmwareFileName,
      data,
      targetDevice: entry.targetDevice,
    };
  }
  return undefined;
}

export async function loadFirmwareFileBytes(
  packageInfo: IProjectPackageInfo,
  variationName: string,
): Promise<IFirmwareFetchResultWithTargetDevice | undefined> {
  const firmwareEntry = packageInfo.firmwares.find(
    (it) => it.variationName === variationName,
  );
  if (firmwareEntry && 'standardFirmwareConfig' in firmwareEntry) {
    const { standardFirmwareConfig } = firmwareEntry;
    const { baseFirmwareType } = standardFirmwareConfig;
    const targetDevice = getFirmwareTargetDeviceFromBaseFirmwareType(
      baseFirmwareType,
    );
    const {
      fileName: sourceFirmwareFileName,
      data: sourceFirmwareBytes,
    } = await fetchStandardBaseFirmware(baseFirmwareType);

    const firmwareFormat = targetDevice === 'rp2040' ? 'uf2' : 'hex';

    const data = applyStandardFirmwareBinaryPatch(
      sourceFirmwareBytes,
      firmwareFormat,
      standardFirmwareConfig,
    );
    return {
      fileName: `${sourceFirmwareFileName}_patched_for_${packageInfo.keyboardName}.${firmwareFormat}`,
      data,
      targetDevice,
    };
  }
  if (firmwareEntry && 'customFirmwareId' in firmwareEntry) {
    return fetchCustomFirmware(firmwareEntry.customFirmwareId);
  }
  return undefined;
}

export async function firmwareFileLoader_loadFirmwareFile(
  origin: IResourceOrigin,
  projectId: string,
  variationName: string,
): Promise<IFirmwareBinaryFileSpec | undefined> {
  const packageInfos = await projectPackageProvider.getAllProjectPackageInfos();
  const packageInfo = packageInfos.find(
    (info) => info.origin === origin && info.projectId === projectId,
  );
  if (!packageInfo) {
    return undefined;
  }
  const loadResult = await loadFirmwareFileBytes(packageInfo, variationName);
  if (!loadResult) {
    return undefined;
  }

  const { fileName: binaryFileName, data, targetDevice } = loadResult;
  const localTempFilePath = appEnv.resolveTempFilePath(
    `remote_firmwares/${binaryFileName}`,
  );
  fsxMkdirpSync(pathDirname(localTempFilePath));

  await fsxWriteFile(localTempFilePath, data);

  return {
    filePath: localTempFilePath,
    targetDevice: targetDevice,
  };
}
