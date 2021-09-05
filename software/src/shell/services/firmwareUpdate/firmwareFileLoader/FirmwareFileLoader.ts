import {
  getFirmwareTargetDeviceFromBaseFirmwareType,
  IFirmwareTargetDevice,
  IProjectPackageInfo,
  IResourceOrigin,
  IStandardBaseFirmwareType,
  IStandardFirmwareEntry,
} from '~/shared';
import { appEnv } from '~/shell/base';
import {
  cacheRemoteResource,
  fetchBinary,
  fetchJson,
  fsxMkdirpSync,
  fsxReadBinaryFile,
  fsxWriteFile,
  pathBasename,
  pathDirname,
  pathResolve,
} from '~/shell/funcs';
import { coreState } from '~/shell/modules/core';
import { IFirmwareBinaryFileSpec } from '~/shell/modules/project/projectResources';
import { applyStandardFirmwareBinaryPatch } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/FirmwareBinaryPatchApplier';
import { IStandardKeyboardInjectedMetaData } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Types';

const config = {
  debugLoadLocalFirmware: false,
};
if (appEnv.isDevelopment) {
  config.debugLoadLocalFirmware = true;
}

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
  const data = await cacheRemoteResource(fetchBinary, url);
  return { fileName, data };
}

const localStandardFirmwarePaths: {
  [key in IStandardBaseFirmwareType]?: string;
} = {
  AvrUnified: pathResolve('../firmware/build/standard/avr/standard_avr.hex'),
  RpUnified: pathResolve('../firmware/build/standard/rp/standard_rp.uf2'),
};

async function debugloadLocalStandardBaseFirmware(
  baseFirmwareType: IStandardBaseFirmwareType,
): Promise<IFirmwareFetchResult> {
  const filePath = localStandardFirmwarePaths[baseFirmwareType];
  if (!filePath) {
    throw new Error(`base firmware ${baseFirmwareType} is not supported yet`);
  }
  const fileName = pathBasename(filePath);
  console.log(`loading local firmware ${filePath}`);
  const data = await fsxReadBinaryFile(filePath);
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
  const summary = (await cacheRemoteResource(
    fetchJson,
    summaryUrl,
  )) as IFirmwareSummaryJson;
  const entry = summary.firmwares.find((it) => it.firmwareId === firmwareId);
  if (entry) {
    const url = `${remoteBaseUrl}/firmwares/${entry.firmwareProjectPath}/${entry.firmwareFileName}`;
    const data = await cacheRemoteResource(fetchBinary, url);
    return {
      fileName: entry.firmwareFileName,
      data,
      targetDevice: entry.targetDevice,
    };
  }
  return undefined;
}

function makeInjectedMetaData(
  packageInfo: IProjectPackageInfo,
  firmwareEntry: IStandardFirmwareEntry,
): IStandardKeyboardInjectedMetaData {
  return {
    keyboardName: packageInfo.keyboardName,
    projectId: packageInfo.projectId,
    variationId: firmwareEntry.variationId,
  };
}

export async function loadFirmwareFileBytes(
  packageInfo: IProjectPackageInfo,
  variationName: string,
): Promise<IFirmwareFetchResultWithTargetDevice | undefined> {
  const firmwareEntry = packageInfo.firmwares.find(
    (it) => it.variationName === variationName,
  );
  if (firmwareEntry?.type === 'standard') {
    const { standardFirmwareConfig } = firmwareEntry;
    const { baseFirmwareType } = standardFirmwareConfig;
    const targetDevice =
      getFirmwareTargetDeviceFromBaseFirmwareType(baseFirmwareType);

    const firmwareLoader = config.debugLoadLocalFirmware
      ? debugloadLocalStandardBaseFirmware
      : fetchStandardBaseFirmware;

    const { fileName: sourceFirmwareFileName, data: sourceFirmwareBytes } =
      await firmwareLoader(baseFirmwareType);

    const firmwareFormat = targetDevice === 'rp2040' ? 'uf2' : 'hex';

    const fileName = `${sourceFirmwareFileName}_patched_for_${packageInfo.keyboardName}.${firmwareFormat}`;

    const meta = makeInjectedMetaData(packageInfo, firmwareEntry);

    const data = applyStandardFirmwareBinaryPatch(
      sourceFirmwareBytes,
      firmwareFormat,
      standardFirmwareConfig,
      meta,
    );

    return {
      fileName,
      data,
      targetDevice,
    };
  }
  if (firmwareEntry?.type === 'custom') {
    return await fetchCustomFirmware(firmwareEntry.customFirmwareId);
  }
  return undefined;
}

export async function firmwareFileLoader_loadFirmwareFile(
  origin: IResourceOrigin,
  projectId: string,
  variationName: string,
): Promise<IFirmwareBinaryFileSpec | undefined> {
  const packageInfos = coreState.allProjectPackageInfos;
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
