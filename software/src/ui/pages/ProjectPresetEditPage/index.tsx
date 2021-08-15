import { css, FC, jsx, useMemo } from 'qx';
import { fallbackPersistProfileData, IPersistProfileData } from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectPresetEdit, pageActions } from '~/ui/commonModels';
import { projectPackagesHooks, projectPackagesWriter } from '~/ui/commonStore';
import { AssignerGeneralComponent } from '~/ui/pages/editor-page/EditorGeneralComponent';

type Props = {
  spec: IPageSpec_ProjectPresetEdit;
};

export const ProjectPresetEditPage: FC<Props> = ({ spec: { presetName } }) => {
  const projectInfo = projectPackagesHooks.useEditTargetProject();
  const originalProfile = useMemo(() => {
    const entry = projectInfo.presets.find(
      (it) => it.presetName === presetName,
    );
    return entry?.data || fallbackPersistProfileData;
  }, [projectInfo]);

  const saveProfile = (newProfile: IPersistProfileData) => {
    projectPackagesWriter.saveLocalProjectPreset(presetName, newProfile);
  };

  return (
    <div css={style}>
      <div>
        <button onClick={() => pageActions.navigateTo('/projectEdit')}>
          &lt;-back
        </button>
        project preset edit page {presetName}
      </div>
      <AssignerGeneralComponent
        className="editor-frame"
        originalProfile={originalProfile}
        saveProfile={saveProfile}
      />
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;

  display: flex;
  flex-direction: column;
`;