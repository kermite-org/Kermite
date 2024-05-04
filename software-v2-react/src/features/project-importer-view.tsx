import { Box } from "@mui/system";
import { FC, useMemo, useState } from "react";
import useSWR from "swr";
import { bucketDb } from "../core/bucket-db-instance";

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

export const ProjectImporterView: FC = () => {
  const { data: apiCatalogResponse } = useSWR<IApiCatalogResponse>(
    kermiteServerEndpoints.catalog,
    fetcher
  );
  const allProjectIds = useMemo(
    () => apiCatalogResponse?.packages.map((item) => item.projectId),
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

  if (!allProjectIds) return undefined;

  const importSelectedPackage = async () => {
    const packageContent = JSON.parse(
      apiProjectResponse?.packages[0].data ?? ""
    ) as IKmpkgContent;
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
    await bucketDb.project.set(projectId, { keyboardName });
    await bucketDb.projectAsset.setManyByPrefix(
      `${projectId}/`,
      projectAssetItems
    );
    console.log(`project ${keyboardName} imported`);
    // console.log({ content });
  };

  return (
    <Box>
      <Box>{apiProjectResponse?.packages[0]?.keyboardName ?? "--"}</Box>
      <Box>
        <button onClick={importSelectedPackage} disabled={!currentProjectId}>
          import
        </button>
      </Box>
      <Box
        display="inline-flex"
        flexDirection={"column"}
        border="solid 1px #888"
        minWidth={"100px"}
      >
        {allProjectIds.map((id) => (
          <Box
            key={id}
            onClick={() => setCurrentProjectId(id)}
            bgcolor={id === currentProjectId ? "#0CF" : "transparent"}
            sx={{ cursor: "pointer" }}
          >
            {id}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
