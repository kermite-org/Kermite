import {
  generateRandomDeviceInstanceCode,
  getFirmwareTargetDeviceFromBaseFirmwareType,
  ICustomFirmwareEntry,
  IFirmwareOriginEx,
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
import { customFirmwareInfoProvider } from '~/shell/modules/project/CustomFirmwareInfoProvider';
import { applyFirmwareBinaryPatch } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/FirmwareBinaryPatchApplier';
import { IStandardKeyboardInjectedMetaData } from '~/shell/services/firmwareUpdate/firmwareBinaryPatchApplier/Types';
import { IFirmwareBinaryFileSpec } from '~/shell/services/firmwareUpdate/types';

const config = {
  remoteBaseUrl: 'https://app.kermite.org/krs/resources2',
  debugLoadLocalFirmware: false,
};
if (appEnv.isDevelopment) {
  config.debugLoadLocalFirmware = true;
}

type IFirmwareFetchResult = { fileName: string; data: Uint8Array };
type IFirmwareFetchResultWithTargetDevice = {
  fileName: string;
  data: Uint8Array;
  targetDevice: IFirmwareTargetDevice;
};

const helpers = {
  makeInjectedMetaData(
    packageInfo: IProjectPackageInfo,
    variationId: string,
  ): IStandardKeyboardInjectedMetaData {
    return {
      keyboardName: packageInfo.keyboardName,
      projectId: packageInfo.projectId,
      deviceInstanceCode: generateRandomDeviceInstanceCode(),
      variationId,
    };
  },
  getFirmwareFormatFromFileName(fileName: string): 'hex' | 'uf2' {
    return fileName.endsWith('.uf2') ? 'uf2' : 'hex';
  },
};
namespace fetcherOnlineStandard {
  const standardFirmwarePaths: {
    [key in IStandardBaseFirmwareType]?: string;
  } = {
    AvrUnified: 'firmwares/standard/standard_avr.hex',
    RpUnified: 'firmwares/standard/standard_rp.uf2',
    AvrSplit: 'firmwares/standard/standard_avr_split.hex',
    RpSplit: 'firmwares/standard/standard_rp_split.uf2',
    AvrOddSplit: 'firmwares/standard/standard_avr_split.hex',
    RpOddSplit: 'firmwares/standard/standard_rp_split.uf2',
  };

  export async function fetchStandardBaseFirmware(
    baseFirmwareType: IStandardBaseFirmwareType,
  ): Promise<IFirmwareFetchResult> {
    const path = standardFirmwarePaths[baseFirmwareType];
    if (!path) {
      throw new Error(`base firmware ${baseFirmwareType} is not supported yet`);
    }
    const url = `${config.remoteBaseUrl}/${path}`;
    const fileName = pathBasename(url);
    const data = await cacheRemoteResource(fetchBinary, url);
    return { fileName, data };
  }
}

namespace fetcherLocalDebugStandard {
  const localStandardFirmwarePaths: {
    [key in IStandardBaseFirmwareType]?: string;
  } = {
    AvrUnified: pathResolve('../firmware/build/standard/avr/standard_avr.hex'),
    RpUnified: pathResolve('../firmware/build/standard/rp/standard_rp.uf2'),
    AvrSplit: pathResolve(
      '../firmware/build/standard/avr_split/standard_avr_split.hex',
    ),
    RpSplit: pathResolve(
      '../firmware/build/standard/rp_split/standard_rp_split.uf2',
    ),
    AvrOddSplit: pathResolve(
      '../firmware/build/standard/avr_split/standard_avr_split.hex',
    ),
    RpOddSplit: pathResolve(
      '../firmware/build/standard/rp_split/standard_rp_split.uf2',
    ),
  };

  export async function debugLoadLocalStandardBaseFirmware(
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
}

namespace fetcherOnlineCustom {
  type IFirmwareSummaryJson = {
    firmwares: {
      firmwareId: string;
      firmwareProjectPath: string;
      firmwareFileName: string;
      targetDevice: IFirmwareTargetDevice;
    }[];
  };

  export async function fetchCustomFirmware(
    firmwareId: string,
  ): Promise<IFirmwareFetchResultWithTargetDevice | undefined> {
    const summaryUrl = `${config.remoteBaseUrl}/index.firmwares.json`;
    const summary = (await cacheRemoteResource(
      fetchJson,
      summaryUrl,
    )) as IFirmwareSummaryJson;
    const entry = summary.firmwares.find((it) => it.firmwareId === firmwareId);
    if (entry) {
      const url = `${config.remoteBaseUrl}/firmwares/${entry.firmwareProjectPath}/${entry.firmwareFileName}`;
      const data = await cacheRemoteResource(fetchBinary, url);
      return {
        fileName: entry.firmwareFileName,
        data,
        targetDevice: entry.targetDevice,
      };
    }
    return undefined;
  }
}

async function loadFirmwareFileBytes_Standard(
  packageInfo: IProjectPackageInfo,
  firmwareEntry: IStandardFirmwareEntry,
): Promise<IFirmwareFetchResultWithTargetDevice> {
  const { standardFirmwareConfig } = firmwareEntry;
  const { baseFirmwareType } = standardFirmwareConfig;
  const targetDevice =
    getFirmwareTargetDeviceFromBaseFirmwareType(baseFirmwareType);

  const firmwareLoader = config.debugLoadLocalFirmware
    ? fetcherLocalDebugStandard.debugLoadLocalStandardBaseFirmware
    : fetcherOnlineStandard.fetchStandardBaseFirmware;

  const { fileName: sourceFirmwareFileName, data: sourceFirmwareBytes } =
    await firmwareLoader(baseFirmwareType);

  const firmwareFormat = targetDevice === 'rp2040' ? 'uf2' : 'hex';

  const fileName = `${sourceFirmwareFileName}_patched_for_${packageInfo.keyboardName}.${firmwareFormat}`;

  const meta = helpers.makeInjectedMetaData(
    packageInfo,
    firmwareEntry.variationId,
  );

  const data = applyFirmwareBinaryPatch(
    sourceFirmwareBytes,
    firmwareFormat,
    meta,
    standardFirmwareConfig,
  );
  return { fileName, data, targetDevice };
}

async function loadFirmwareFileBytes_CustomOnline(
  packageInfo: IProjectPackageInfo,
  firmwareEntry: ICustomFirmwareEntry,
): Promise<IFirmwareFetchResultWithTargetDevice | undefined> {
  const fetchResult = await fetcherOnlineCustom.fetchCustomFirmware(
    firmwareEntry.customFirmwareId,
  );
  const meta = helpers.makeInjectedMetaData(
    packageInfo,
    firmwareEntry.variationId,
  );
  if (fetchResult) {
    const { fileName, data: rawData, targetDevice } = fetchResult;
    const format = helpers.getFirmwareFormatFromFileName(fileName);
    const data = applyFirmwareBinaryPatch(rawData, format, meta);
    return { fileName, data, targetDevice };
  }
}

async function loadFirmwareFileBytes_CustomLocalBuild(
  packageInfo: IProjectPackageInfo,
  firmwareEntry: ICustomFirmwareEntry,
): Promise<IFirmwareFetchResultWithTargetDevice | undefined> {
  const filePath = customFirmwareInfoProvider.getLocalBuildFirmwareBinaryPath(
    firmwareEntry.customFirmwareId,
  );
  const info = coreState.allCustomFirmwareInfos.find(
    (it) => it.firmwareId === firmwareEntry.customFirmwareId,
  );
  const meta = helpers.makeInjectedMetaData(
    packageInfo,
    firmwareEntry.variationId,
  );
  if (filePath && info) {
    const fileName = pathBasename(filePath);
    console.log(`loading local firmware ${filePath}`);
    const rawData = await fsxReadBinaryFile(filePath);
    const format = helpers.getFirmwareFormatFromFileName(fileName);
    const data = applyFirmwareBinaryPatch(rawData, format, meta);
    return { fileName, data, targetDevice: info.targetDevice };
  }
}

export async function loadFirmwareFileBytes(
  packageInfo: IProjectPackageInfo,
  firmwareVariationId: string,
  firmwareOrigin: IFirmwareOriginEx,
): Promise<IFirmwareFetchResultWithTargetDevice | undefined> {
  const firmwareEntry = packageInfo.firmwares.find(
    (it) => it.variationId === firmwareVariationId,
  );
  if (firmwareEntry?.type === 'standard') {
    return await loadFirmwareFileBytes_Standard(packageInfo, firmwareEntry);
  }
  if (firmwareEntry?.type === 'custom') {
    if (firmwareOrigin === 'online') {
      return await loadFirmwareFileBytes_CustomOnline(
        packageInfo,
        firmwareEntry,
      );
    } else if (firmwareOrigin === 'localBuild') {
      return await loadFirmwareFileBytes_CustomLocalBuild(
        packageInfo,
        firmwareEntry,
      );
    }
  }
  return undefined;
}

export async function firmwareFileLoader_loadFirmwareFileByPackageInfo(
  packageInfo: IProjectPackageInfo,
  firmwareVariationId: string,
  firmwareOrigin: IFirmwareOriginEx,
): Promise<IFirmwareBinaryFileSpec | undefined> {
  const loadResult = await loadFirmwareFileBytes(
    packageInfo,
    firmwareVariationId,
    firmwareOrigin,
  );
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

export async function firmwareFileLoader_loadFirmwareFile(
  origin: IResourceOrigin,
  projectId: string,
  firmwareName: string,
  firmwareOrigin: IFirmwareOriginEx,
): Promise<IFirmwareBinaryFileSpec | undefined> {
  const packageInfos = coreState.allProjectPackageInfos;
  const packageInfo = packageInfos.find(
    (info) => info.origin === origin && info.projectId === projectId,
  );
  if (!packageInfo) {
    return undefined;
  }
  return await firmwareFileLoader_loadFirmwareFileByPackageInfo(
    packageInfo,
    firmwareName,
    firmwareOrigin,
  );
}
