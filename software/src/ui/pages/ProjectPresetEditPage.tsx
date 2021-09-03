import { css, FC, jsx, useMemo } from 'qx';
import { fallbackPersistProfileData } from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectPresetEdit } from '~/ui/commonModels';
import { projectPackagesHooks, projectPackagesWriter } from '~/ui/commonStore';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import {
  AssignerGeneralComponent,
  AssignerGeneralComponent_OutputPropsSupplier,
} from '~/ui/pages/editor-core';

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

  const { isModified, emitSavingDesign } =
    AssignerGeneralComponent_OutputPropsSupplier;

  const saveHandler = () => {
    const newProfile = emitSavingDesign();
    projectPackagesWriter.saveLocalProjectPreset(presetName, newProfile);
  };

  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project preset: ${presetName}`}
        backPagePath="/projectEdit"
        canSave={isModified}
        saveHandler={saveHandler}
      />
      <AssignerGeneralComponent originalProfile={originalProfile} />
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
