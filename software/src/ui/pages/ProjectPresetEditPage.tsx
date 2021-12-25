import { css, FC, jsx, useState } from 'alumina';
import { fallbackProjectProfileEntry, IProjectProfileEntry } from '~/shared';
import { colors, uiConfiguration } from '~/ui/base';
import { IPageSpec_ProjectPresetView } from '~/ui/commonModels';
import { RouteHeaderBar } from '~/ui/elements/frames';
import {
  AssignerGeneralComponent,
  AssignerGeneralComponent_OutputPropsSupplier,
} from '~/ui/featureEditors';
import {
  projectPackagesReader,
  projectPackagesWriter,
  uiActions,
} from '~/ui/store';

type Props = {
  spec: IPageSpec_ProjectPresetView;
};

const helpers = {
  loadSourceProfileEntry(
    projectKey: string,
    presetName: string,
  ): IProjectProfileEntry {
    const projectInfo =
      projectPackagesReader.findProjectInfoByProjectKey(projectKey);
    const profileEntry = projectInfo?.profiles.find(
      (it) => it.profileName === presetName,
    );
    return profileEntry || fallbackProjectProfileEntry;
  },
};

export const ProjectPresetEditPage: FC<Props> = ({
  spec: { projectKey, presetName, canEdit },
}) => {
  const [sourceProfileEntry, setSourceProfileEntry] = useState(
    helpers.loadSourceProfileEntry(projectKey, presetName),
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
        backHandler={uiActions.closeSubPage}
        canSave={isModified}
        saveHandler={(canEdit && saveHandler) || undefined}
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
