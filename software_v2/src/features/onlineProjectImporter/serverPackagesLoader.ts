import { appConfig } from "~/base";
import { fetchJson } from "~/funcs";
import { serverPackageMigrator_migratePackagePKG0ToPKG1 } from "./serverPackageMigrator";

type IProjectPackageFileContent_stub = any;
export interface IServerPackageWrapperItem {
  projectId: string;
  keyboardName: string;
  data: IProjectPackageFileContent_stub;
  authorDisplayName: string;
  authorIconUrl: string;
  isOfficial: boolean;
  isDevelopment: boolean;
  comment: string;
  dataHash: string;
  revision: number;
  timeStamp: number;
}

namespace nsServerPackageLoaderCore {
  type IApiPackagesCatalogResponse = {
    packages: {
      projectId: string;
      status: "Package";
      timeStamp: number;
    }[];
  };

  type IApiProjectPackageWrapperItemPartial = {
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
  };

  type IApiPackagesProjectsProjectIdResponse = {
    packages: IApiProjectPackageWrapperItemPartial[];
    suspends: IApiProjectPackageWrapperItemPartial[];
  };

  type IApiUsersUserIdResponsePartial = {
    // id: string;
    displayName: string;
    // comment: string;
    // role: string;
    // loginProvider: string;
    // showLinkId: boolean;
  };

  export async function loadServerPackages(): Promise<
    IServerPackageWrapperItem[]
  > {
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

          console.log({ packageRes });

          const packageRawData = packageRes.packages[0];
          if (packageRawData) {
            const {
              projectId,
              keyboardName,
              official: isOfficial,
              development: isDevelopment,
              data: rawData,
              userId,
              comment,
              dataHash,
              revision,
            } = packageRawData;
            const userInfo = (await fetchJson(
              `${appConfig.kermiteServerUrl}/api/users/${userId}`
            )) as IApiUsersUserIdResponsePartial;
            const authorDisplayName = userInfo.displayName;
            const authorIconUrl = `${appConfig.kermiteServerUrl}/api/avatar/${userId}`;

            const data = serverPackageMigrator_migratePackagePKG0ToPKG1(
              JSON.parse(rawData)
            );

            const content: IServerPackageWrapperItem = {
              projectId,
              keyboardName,
              data,
              isOfficial,
              isDevelopment,
              authorDisplayName,
              authorIconUrl,
              comment,
              dataHash,
              revision,
              timeStamp: pk.timeStamp,
            };
            return content;
          }
        })
      )
    ).filter((it) => !!it) as IServerPackageWrapperItem[];
  }
}

//--------
//entry
export interface IServerPackagesLoader {
  loaderServerPackages(): Promise<IServerPackageWrapperItem[]>;
}

export const serverPackagesLoader: IServerPackagesLoader = {
  async loaderServerPackages() {
    return nsServerPackageLoaderCore.loadServerPackages();
  },
};
