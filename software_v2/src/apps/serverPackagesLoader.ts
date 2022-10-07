import { appConfig } from "~/base";
import { fetchJson } from "~/funcs";

export interface IServerPackageWrapperItem {
  projectId: string;
  keyboardName: string;
  data: IProjectPackageFileContent;
  // dataHash: string;
  authorDisplayName: string;
  authorIconUrl: string;
  // revision: number;
  isOfficial: boolean;
  isDevelopment: boolean;
  // timeStamp: number;
}

export interface IServerPackagesLoader {
  loaderServerPackages(): Promise<IServerPackageWrapperItem[]>;
}

type IApiPackagesCatalogResponse = {
  packages: {
    projectId: string;
    status: "Package";
    timeStamp: number;
  }[];
};

interface IApiProjectPackageWrapperItemPartial {
  id: string;
  keyboardName: string;
  projectId: string;
  userId: string;
  data: string; // content of .kmpkg
  dataHash: string;
  revision: number;
  official: boolean;
  development: boolean;
  comment: string;
}

type IApiPackagesProjectsProjectIdResponse = {
  packages: IApiProjectPackageWrapperItemPartial[];
  suspends: IApiProjectPackageWrapperItemPartial[];
};

interface IUserApiResponsePartial {
  // id: string;
  displayName: string;
  // comment: string;
  // role: string;
  // loginProvider: string;
  // showLinkId: boolean;
}

type IStandardFirmwareConfig_stub = any;
type IPersistKeyboardDesign_stub = any;
type IIPersistProfileData_stub = any;

export interface IStandardFirmwareEntry {
  type: "standard";
  variationId: string;
  firmwareName: string;
  standardFirmwareConfig: IStandardFirmwareConfig_stub;
}

export interface ICustomFirmwareEntry {
  type: "custom";
  variationId: string;
  firmwareName: string;
  customFirmwareId: string;
}

export type IProjectFirmwareEntry =
  | IStandardFirmwareEntry
  | ICustomFirmwareEntry;

export interface IProjectLayoutEntry {
  layoutName: string;
  data: IPersistKeyboardDesign_stub;
}

export interface IProjectProfileEntry {
  profileName: string;
  data: IIPersistProfileData_stub;
}

export interface IProjectPackageFileContent {
  formatRevision: "PKG0";
  projectId: string;
  keyboardName: string;
  firmwares: IProjectFirmwareEntry[];
  layouts: IProjectLayoutEntry[];
  profiles: IProjectProfileEntry[];
}

export const serverPackagesLoader: IServerPackagesLoader = {
  async loaderServerPackages() {
    const { kermiteServerUrl } = appConfig;
    const catalogRes = (await fetchJson(
      `${kermiteServerUrl}/api/packages/catalog`
    )) as IApiPackagesCatalogResponse;
    console.log({ catalogRes });

    return (
      await Promise.all(
        catalogRes.packages.map(async (pk) => {
          const packageRes = (await fetchJson(
            `${appConfig.kermiteServerUrl}/api/packages/projects/${pk.projectId}`
          )) as IApiPackagesProjectsProjectIdResponse;

          const packageRawData = packageRes.packages[0];
          if (packageRawData) {
            const {
              projectId,
              keyboardName,
              official: isOfficial,
              development: isDevelopment,
              data: rawData,
              userId,
            } = packageRawData;
            const userInfo = (await fetchJson(
              `${appConfig.kermiteServerUrl}/api/users/${userId}`
            )) as IUserApiResponsePartial;
            const authorDisplayName = userInfo.displayName;
            const authorIconUrl = `${appConfig.kermiteServerUrl}/api/avatar/${userId}`;

            const content: IServerPackageWrapperItem = {
              projectId,
              keyboardName,
              data: JSON.parse(rawData),
              // dataHash,
              // revision,
              isOfficial,
              isDevelopment,
              authorDisplayName,
              authorIconUrl,
              // timeStamp,
            };
            return content;
          }
        })
      )
    ).filter((it) => !!it) as IServerPackageWrapperItem[];
  },
};
