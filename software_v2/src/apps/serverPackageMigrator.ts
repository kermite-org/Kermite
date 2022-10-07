import { compareObjectByJsonStringify } from "~/funcs";

type IPersistKeyboardDesign_stub = { [key in string]: any };

type IStandardFirmwareEntry = {
  type: "standard";
  variationId: any;
  firmwareName: any;
  standardFirmwareConfig: any;
};

type ICustomFirmwareEntry = {
  type: "custom";
  variationId: any;
  firmwareName: any;
  customFirmwareId: any;
};

type IProjectLayoutEntry = {
  layoutName: string;
  data: IPersistKeyboardDesign_stub;
};

type IPersistProfileDataForPKG0 = {
  formatRevision: any;
  projectId: any;
  settings: any;
  layers: any;
  assigns: any;
  mappingEntries: any;
  //プロファイルはプロファイル固有レイアウトを内包している
  keyboardDesign: IPersistKeyboardDesign_stub;
};

type IPersistProfileDataForPKG1 = {
  formatRevision: any;
  projectId: any;
  settings: any;
  layers: any;
  assigns: any;
  mappingEntries: any;
  //プロファイルはレイアウトの参照を保持する
  referredLayoutName: string;
};

type IProjectPackageFileContentPKG0 = {
  formatRevision: "PKG0";
  projectId: string;
  keyboardName: string;
  //標準ファームウェアとカスタムファームウェアがある
  firmwares: (IStandardFirmwareEntry | ICustomFirmwareEntry)[];
  layouts: IProjectLayoutEntry[];
  profiles: {
    profileName: string;
    data: IPersistProfileDataForPKG0;
  }[];
};

type IProjectPackageFileContentPKG1 = {
  formatRevision: "PKG1";
  projectId: string;
  keyboardName: string;
  //カスタムファームウェアはドロップして標準ファームウェアのみ残す
  firmwares: IStandardFirmwareEntry[];
  layouts: IProjectLayoutEntry[];
  profiles: {
    profileName: string;
    data: IPersistProfileDataForPKG1;
  }[];
};

function findReferredLayoutName(
  layout: IPersistKeyboardDesign_stub,
  layouts: IProjectLayoutEntry[]
): string | undefined {
  const referredLayout = layouts.find((la) =>
    compareObjectByJsonStringify(layout, la.data)
  );
  return referredLayout?.layoutName;
}

export function serverPackageMigrator_migratePackagePKG0ToPKG1(
  source: IProjectPackageFileContentPKG0 | IProjectPackageFileContentPKG1
): IProjectPackageFileContentPKG1 {
  if (source.formatRevision === "PKG1") {
    return source;
  }

  const additionalLayoutEntities: IProjectLayoutEntry[] = [];

  const profiles = source.profiles.map((prof) => {
    const profileLayout = prof.data.keyboardDesign;
    let referredLayoutName = findReferredLayoutName(
      profileLayout,
      source.layouts
    );
    if (!referredLayoutName) {
      referredLayoutName = `layout_for_profile_${prof.profileName}`;
      additionalLayoutEntities.push({
        layoutName: referredLayoutName,
        data: profileLayout,
      });
    }
    const { keyboardDesign: _, ...dataRestProps } = prof.data;
    return {
      profileName: prof.profileName,
      data: {
        ...dataRestProps,
        referredLayoutName,
      },
    };
  });

  const layouts = [...source.layouts, ...additionalLayoutEntities];

  const firmwares = source.firmwares.filter(
    (it) => it.type === "standard"
  ) as IStandardFirmwareEntry[];

  return {
    formatRevision: "PKG1",
    projectId: source.projectId,
    keyboardName: source.keyboardName,
    profiles,
    layouts,
    firmwares,
  };
}
