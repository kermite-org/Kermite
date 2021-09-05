import { css, FC, jsx, useMemo } from 'qx';
import {
  createFallbackPersistKeyboardDesign,
  IPersistKeyboardDesign,
} from '~/shared';
import { uiTheme } from '~/ui/base';
import { IPageSpec_ProjectLayoutEdit } from '~/ui/commonModels';
import {
  pageActions,
  projectPackagesHooks,
  projectPackagesWriter,
} from '~/ui/commonStore';
import { LayouterGeneralComponent } from '~/ui/features';

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

  const saveLayout = (newLayout: IPersistKeyboardDesign) => {
    projectPackagesWriter.saveLocalProjectLayout(layoutName, newLayout);
  };

  return (
    <div css={style}>
      <div>
        <button onClick={() => pageActions.navigateTo('/projectEdit')}>
          &lt;-back
        </button>
        project layout edit page {layoutName}
      </div>

      <LayouterGeneralComponent layout={layout} saveLayout={saveLayout} />
    </div>
  );
};

const style = css`
  background: ${uiTheme.colors.clBackground};
  color: ${uiTheme.colors.clMainText};
  height: 100%;
  padding: 15px;
`;
