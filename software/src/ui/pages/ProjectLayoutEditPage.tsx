import { css, FC, jsx, useMemo } from 'qx';
import { createFallbackPersistKeyboardDesign } from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectLayoutEdit } from '~/ui/commonModels';
import { projectPackagesHooks, projectPackagesWriter } from '~/ui/commonStore';
import { RouteHeaderBar } from '~/ui/components/organisms/RouteHeaderBar/RouteHeaderBar';
import {
  LayouterGeneralComponent,
  LayouterGeneralComponent_OutputPropsSupplier,
} from '~/ui/features';

type Props = {
  spec: IPageSpec_ProjectLayoutEdit;
};

export const ProjectLayoutEditPage: FC<Props> = ({ spec: { layoutName } }) => {
  const projectInfo = projectPackagesHooks.useEditTargetProject();
  const layout = useMemo(() => {
    const entry = projectInfo.layouts.find(
      (it) => it.layoutName === layoutName,
    );
    return entry?.data || createFallbackPersistKeyboardDesign();
  }, [projectInfo]);

  const { isModified, emitSavingDesign } =
    LayouterGeneralComponent_OutputPropsSupplier;

  const saveHandler = () => {
    projectPackagesWriter.saveLocalProjectLayout(
      layoutName,
      emitSavingDesign(),
    );
  };

  return (
    <div css={style}>
      <RouteHeaderBar
        title={`edit project layout: ${layoutName}`}
        backPagePath="/projectEdit"
        canSave={isModified}
        saveHandler={saveHandler}
      />
      <div className="content">
        <LayouterGeneralComponent layout={layout} />
      </div>
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  display: flex;
  flex-direction: column;
  > .content {
    flex-grow: 1;
  }
`;
