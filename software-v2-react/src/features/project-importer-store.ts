import { useMemo, useState } from "react";
import useSWR from "swr";
import { bucketDb } from "../core/bucket-db-instance";
import { useBucketDbNotifier } from "../core/bucket-db-notifier";

const kermiteServerEndpoints = {
  base: `https://server.kermite.org`,
  catalog: () => `${kermiteServerEndpoints.base}/api/packages/catalog`,
  project: (projectId: string) =>
    `${kermiteServerEndpoints.base}/api/packages/projects/${projectId}`,
};

type IApiCatalogResponse = {
  packages: {
    status: "Package";
    projectId: string;
    timeStamp: number;
  }[];
};

type IApiProjectResponse = {
  packages: {
    id: string;
    keyboardName: string;
    projectId: string;
    userId: string;
    data: string;
  }[];
};

type IKmpkgContent = {
  formatRevision: "PKG0";
  projectId: string;
  keyboardName: string;
  profiles: { profileName: string; data: any }[];
  layouts: { layoutName: string; data: any }[];
  firmwares: {
    firmwareName: string;
    type: "standard";
    variationId: string;
    standardFirmwareConfig: any;
  }[];
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

const m = {
  extractProjectAssetItems(packageData: string) {
    const packageContent = JSON.parse(packageData) as IKmpkgContent;
    type IBucketProjectAssetItem = {
      subPath: string;
      value: object;
    };
    const { projectId, keyboardName } = packageContent;
    const projectAssetItems: IBucketProjectAssetItem[] = [
      ...packageContent.profiles.map((item) => ({
        subPath: `profiles/${item.profileName}`,
        value: item.data,
      })),
      ...packageContent.layouts.map((item) => ({
        subPath: `layouts/${item.layoutName}`,
        value: item.data,
      })),
      ...packageContent.firmwares.map((item) => {
        const { firmwareName, ...data } = item;
        return {
          subPath: `firmwares/${firmwareName}`,
          value: data,
        };
      }),
    ];
    return { projectId, keyboardName, projectAssetItems };
  },
};

export const useProjectImporterStore = () => {
  const { data: apiCatalogResponse } = useSWR<IApiCatalogResponse>(
    kermiteServerEndpoints.catalog,
    fetcher
  );
  const allProjectIds = useMemo(
    () => apiCatalogResponse?.packages.map((item) => item.projectId) ?? [],
    [apiCatalogResponse]
  );
  const [currentProjectId, setCurrentProjectId] = useState("");

  const projectResourceUri = useMemo(
    () =>
      currentProjectId
        ? kermiteServerEndpoints.project(currentProjectId)
        : undefined,
    [currentProjectId]
  );

  const { data: apiProjectResponse } = useSWR<IApiProjectResponse>(
    projectResourceUri,
    fetcher
  );
  const currentPackage = apiProjectResponse?.packages[0];

  const dbNotifier = useBucketDbNotifier();

  const importSelectedPackage = async () => {
    const { projectId, keyboardName, projectAssetItems } =
      m.extractProjectAssetItems(apiProjectResponse?.packages[0].data ?? "");
    await bucketDb.project.set(projectId, { keyboardName });
    await bucketDb.projectAsset.setManyByPrefix(
      `${projectId}/`,
      projectAssetItems
    );
    console.log(`project ${keyboardName} imported`);
    dbNotifier.notify();
    // console.log({ content });
  };

  return {
    allProjectIds,
    currentProjectId,
    setCurrentProjectId,
    currentPackage,
    importSelectedPackage,
  };
};
