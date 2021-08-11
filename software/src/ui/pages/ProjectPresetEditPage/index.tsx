import { css, FC, jsx, useMemo } from 'qx';
import { fallbackPersistProfileData, IPersistProfileData } from '~/shared';
import { uiTheme } from '~/ui/base';
import {
  IPageSpec_ProjectPresetEdit,
  pageActions,
  projectPackagesHooks,
} from '~/ui/commonModels';

type Props = {
  spec: IPageSpec_ProjectPresetEdit;
};

export const ProjectPresetEditPage: FC<Props> = ({ spec: { presetName } }) => {
  const projectInfo = projectPackagesHooks.useEditTargetProject();
  const profile = useMemo(() => {
    const entry = projectInfo.profiles.find(
      (it) => it.profileName === presetName,
    );
    return entry?.data || fallbackPersistProfileData;
  }, [projectInfo]);

  const saveProfile = (newProfile: IPersistProfileData) => {
    // projectPackagesMutations.saveLocalProjectLayout(layoutName, newLayout);
  };

  return (
    <div css={style}>
      <div>
        <button onClick={() => pageActions.navigateTo('/projectEdit')}>
          &lt;-back
        </button>
        project preset edit page {presetName}
      </div>

      {/* <LayouterGeneralComponent layout={layout} saveLayout={saveLayout} /> */}
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;
`;
