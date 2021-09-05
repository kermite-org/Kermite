import { css, FC, jsx } from 'qx';
import { fallbackProjectPresetEntry, IProjectPresetEntry } from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectPresetEdit } from '~/ui/commonModels';
import { projectPackagesWriter, uiReaders } from '~/ui/commonStore';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import { useMemoEx } from '~/ui/helpers';
import {
  AssignerGeneralComponent,
  AssignerGeneralComponent_OutputPropsSupplier,
} from '~/ui/pages/editor-core';

type Props = {
  spec: IPageSpec_ProjectPresetEdit;
};

const readers = {
  getSourcePresetEntry(resourceId: string): IProjectPresetEntry {
    const projectInfo = uiReaders.editTargetProject;
    const presetEntry = projectInfo?.presets.find(
      (it) => it.resourceId === resourceId,
    );
    return presetEntry || fallbackProjectPresetEntry;
  },
};

export const ProjectPresetEditPage: FC<Props> = ({
  spec: { presetResourceId },
}) => {
  const sourcePresetEntry = useMemoEx(readers.getSourcePresetEntry, [
    presetResourceId,
  ]);
  const { isModified, emitSavingDesign } =
    AssignerGeneralComponent_OutputPropsSupplier;

  const saveHandler = () => {
    projectPackagesWriter.saveLocalProjectPreset({
      ...sourcePresetEntry,
      data: emitSavingDesign(),
    });
  };

  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project preset: ${sourcePresetEntry.presetName}`}
        backPagePath="/projectEdit"
        canSave={isModified}
        saveHandler={saveHandler}
      />
      <AssignerGeneralComponent originalProfile={sourcePresetEntry.data} />
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  display: flex;
  flex-direction: column;
`;
