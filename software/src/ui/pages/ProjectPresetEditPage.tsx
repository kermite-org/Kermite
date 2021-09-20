import { css, FC, jsx, useState } from 'qx';
import { fallbackProjectPresetEntry, IProjectPresetEntry } from '~/shared';
import { uiConfiguration, uiTheme } from '~/ui/base';
import { IPageSpec_ProjectPresetEdit } from '~/ui/commonModels';
import { RouteHeaderBar } from '~/ui/components';
import {
  AssignerGeneralComponent,
  AssignerGeneralComponent_OutputPropsSupplier,
} from '~/ui/editors';
import { projectPackagesWriter, uiActions, uiReaders } from '~/ui/store';

type Props = {
  spec: IPageSpec_ProjectPresetEdit;
};

const helpers = {
  loadSourcePresetEntry(presetName: string): IProjectPresetEntry {
    const projectInfo = uiReaders.editTargetProject;
    const presetEntry = projectInfo?.presets.find(
      (it) => it.presetName === presetName,
    );
    return presetEntry || fallbackProjectPresetEntry;
  },
};

export const ProjectPresetEditPage: FC<Props> = ({ spec: { presetName } }) => {
  const [sourcePresetEntry, setSourcePresetEntry] = useState(
    helpers.loadSourcePresetEntry(presetName),
  );

  const { isModified, emitSavingDesign } =
    AssignerGeneralComponent_OutputPropsSupplier;

  const saveHandler = () => {
    const newPresetEntry: IProjectPresetEntry = {
      ...sourcePresetEntry,
      data: emitSavingDesign(),
    };
    projectPackagesWriter.saveLocalProjectPreset(newPresetEntry);
    if (!uiConfiguration.closeProjectResourceEditPageOnSave) {
      setSourcePresetEntry(newPresetEntry);
    } else {
      uiActions.closeSubPage();
    }
  };

  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project preset: ${sourcePresetEntry.presetName}`}
        backPagePath="/projectResource"
        canSave={isModified}
        saveHandler={saveHandler}
      />
      <AssignerGeneralComponent originalProfile={sourcePresetEntry.data} />
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clPageBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  display: flex;
  flex-direction: column;
`;
