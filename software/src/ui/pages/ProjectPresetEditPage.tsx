import { css, FC, jsx, useState } from 'qx';
import { fallbackProjectProfileEntry, IProjectProfileEntry } from '~/shared';
import { colors, uiConfiguration } from '~/ui/base';
import { IPageSpec_ProjectPresetEdit } from '~/ui/commonModels';
import { RouteHeaderBar } from '~/ui/elements/frames';
import {
  AssignerGeneralComponent,
  AssignerGeneralComponent_OutputPropsSupplier,
} from '~/ui/featureEditors';
import { projectPackagesWriter, uiActions, uiReaders } from '~/ui/store';

type Props = {
  spec: IPageSpec_ProjectPresetEdit;
};

const helpers = {
  loadSourceProfileEntry(presetName: string): IProjectProfileEntry {
    const projectInfo = uiReaders.editTargetProject;
    const profileEntry = projectInfo?.profiles.find(
      (it) => it.profileName === presetName,
    );
    return profileEntry || fallbackProjectProfileEntry;
  },
};

export const ProjectPresetEditPage: FC<Props> = ({ spec: { presetName } }) => {
  const [sourceProfileEntry, setSourceProfileEntry] = useState(
    helpers.loadSourceProfileEntry(presetName),
  );

  const { isModified, emitSavingDesign } =
    AssignerGeneralComponent_OutputPropsSupplier;

  const saveHandler = () => {
    const newProfileEntry: IProjectProfileEntry = {
      ...sourceProfileEntry,
      data: emitSavingDesign(),
    };
    projectPackagesWriter.saveLocalProjectResourceItem(
      'profile',
      newProfileEntry,
    );
    if (!uiConfiguration.closeProjectResourceEditPageOnSave) {
      setSourceProfileEntry(newProfileEntry);
    } else {
      uiActions.closeSubPage();
    }
  };

  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project preset: ${sourceProfileEntry.profileName}`}
        backPagePath="/projectResource"
        canSave={isModified}
        saveHandler={saveHandler}
      />
      <AssignerGeneralComponent originalProfile={sourceProfileEntry.data} />
    </div>
  );
};

const style = css`
  background: ${colors.clPageBackground};
  color: ${colors.clMainText};
  height: 100%;
  display: flex;
  flex-direction: column;
`;
