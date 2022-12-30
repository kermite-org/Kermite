import { compareObjectByJsonStringify } from '~/app-shared';

type IPersistKeyboardDesign_stub = { [key in string]: any };

type IStandardFirmwareEntryForPKG0 = {
  type: 'standard';
  variationId: string;
  firmwareName: string;
  standardFirmwareConfig: any;
};

type ICustomFirmwareEntryForPKG0 = {
  type: 'custom';
  variationId: string;
  firmwareName: string;
  customFirmwareId: any;
};

type IStandardFirmwareEntryForPKG1 = {
  name: string;
  data: {
    type: 'standard';
    variationId: string;
    standardFirmwareConfig: any;
  };
};

type IProjectLayoutEntryForPKG0 = {
  layoutName: string;
  data: IPersistKeyboardDesign_stub;
};

type IProjectLayoutEntryForPKG1 = {
  name: string;
  data: IPersistKeyboardDesign_stub;
};

type IPersistProfileDataForPKG0 = {
  formatRevision: 'PRF06';
  projectId: any;
  settings: any;
  layers: any;
  assigns: any;
  mappingEntries: any;
  //プロファイルはプロファイル固有レイアウトを内包している
  keyboardDesign: IPersistKeyboardDesign_stub;
};

type IPersistProfileDataForPKG1 = {
  formatRevision: 'PRF07';
  projectId: any;
  settings: any;
  layers: any;
  assigns: any;
  mappingEntries: any;
  //プロファイルはレイアウトの参照を保持する
  referredLayoutName: string;
};

type IProjectPackageFileContentPKG0 = {
  formatRevision: 'PKG0';
  projectId: string;
  keyboardName: string;
  //標準ファームウェアとカスタムファームウェアがある
  firmwares: (IStandardFirmwareEntryForPKG0 | ICustomFirmwareEntryForPKG0)[];
  layouts: IProjectLayoutEntryForPKG0[];
  profiles: {
    profileName: string;
    data: IPersistProfileDataForPKG0;
  }[];
};

type IProjectPackageFileContentPKG1 = {
  formatRevision: 'PKG1';
  projectId: string;
  projectName: string;
  variationName: string;
  //カスタムファームウェアはドロップして標準ファームウェアのみ残す
  firmwares: IStandardFirmwareEntryForPKG1[];
  layouts: IProjectLayoutEntryForPKG1[];
  profiles: {
    name: string;
    data: IPersistProfileDataForPKG1;
  }[];
};

function findReferredLayoutName(
  layout: IPersistKeyboardDesign_stub,
  layouts: IProjectLayoutEntryForPKG0[],
): string | undefined {
  const referredLayout = layouts.find((la) =>
    compareObjectByJsonStringify(layout, la.data),
  );
  return referredLayout?.layoutName;
}

export function serverPackageMigrator_migratePackagePKG0ToPKG1(
  source: IProjectPackageFileContentPKG0 | IProjectPackageFileContentPKG1,
): IProjectPackageFileContentPKG1 {
  if (source.formatRevision === 'PKG1') {
    return source;
  }

  const additionalLayoutEntities: IProjectLayoutEntryForPKG1[] = [];

  const profiles = source.profiles.map((prof) => {
    const profileLayout = prof.data.keyboardDesign;
    let referredLayoutName = findReferredLayoutName(
      profileLayout,
      source.layouts,
    );
    if (!referredLayoutName) {
      referredLayoutName = `layout_for_profile_${prof.profileName}`;
      additionalLayoutEntities.push({
        name: referredLayoutName,
        data: profileLayout,
      });
    }
    const { keyboardDesign: _, ...dataRestProps } = prof.data;
    return {
      name: prof.profileName,
      data: {
        ...dataRestProps,
        formatRevision: 'PRF07' as const,
        referredLayoutName,
      },
    };
  });

  const layouts = [
    ...source.layouts.map((la) => ({ name: la.layoutName, data: la.data })),
    ...additionalLayoutEntities,
  ];

  const firmwares = (
    source.firmwares.filter(
      (it) => it.type === 'standard',
    ) as IStandardFirmwareEntryForPKG0[]
  ).map((it) => ({
    name: it.firmwareName,
    data: {
      type: 'standard',
      variationId: it.variationId,
      standardFirmwareConfig: it.standardFirmwareConfig,
    },
  })) as IStandardFirmwareEntryForPKG1[];

  return {
    formatRevision: 'PKG1',
    projectId: source.projectId,
    projectName: source.keyboardName,
    variationName: '',
    profiles,
    layouts,
    firmwares,
  };
}
